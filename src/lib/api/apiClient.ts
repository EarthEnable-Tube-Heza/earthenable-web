/**
 * API Client
 *
 * Axios-based HTTP client with automatic token refresh and request queueing.
 * Implements the same patterns as the mobile app for consistency.
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { config, getAPIUrl } from "../config";
import {
  TokenResponse,
  ExtendedTokenResponse,
  GoogleAuthRequest,
  TOKEN_STORAGE_KEYS,
  calculateTokenExpiry,
  User,
  UserWithEmployeeDetail,
  PaginatedUsersResponse,
  UserStatsResponse,
  TaskSubject,
  CreateTaskSubject,
  PaginatedTaskSubjectsResponse,
  TaskSubjectForm,
  CreateFormMapping,
  PaginatedFormMappingsResponse,
  UpdateFormMapping,
  EntityListResponse,
  UserWithEntityAccess,
  PaginatedUserEntityAccessResponse,
  GrantEntityAccessRequest,
  BulkGrantEntityAccessRequest,
  EntityAccessResponse,
  TaskDetail,
  TaskCompleteResponse,
  PaginatedTasksResponse,
  TaskStatsResponse,
  UpdateTaskRequest,
  ReassignTaskRequest,
  BulkReassignTasksRequest,
  BulkReassignResponse,
  TaskAssignee,
  LocationValuesResponse,
  OrgHierarchyEntry,
  PaginatedOrgHierarchyResponse,
  CreateOrgHierarchyRequest,
  UpdateOrgHierarchyRequest,
  OrgRoleOption,
  RolePermissionMapping,
  RolePermissionMappingListResponse,
  CreateRolePermissionMappingRequest,
  UpdateRolePermissionMappingRequest,
  PermissionTiersResponse,
  EmployeeDetail,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EndEmployeeRequest,
  DepartmentResponse,
  BranchResponse,
  JobRoleResponse,
  // Monitoring types
  ServerHealthResponse,
  SalesforceSyncStatusResponse,
  UserActivityStatsResponse,
  FeatureUsageResponse,
  SystemResourcesResponse,
  EndpointUsageResponse,
  HierarchicalFeatureUsageResponse,
  PaginatedActivityResponse,
  FeatureUsersResponse,
  PlatformAnalyticsResponse,
  ActiveAppUsersResponse,
  ActivityTimeSeriesResponse,
  UserLoginFrequencyResponse,
  // Sync types
  SalesforceSyncHistoryResponse,
  SalesforceSyncStatsResponse,
  UserSyncSessionsResponse,
  UserSyncStatesResponse,
  UserSyncStatsResponse,
  // Notification types
  PaginatedNotificationsResponse,
  NotificationStatsResponse,
  NotificationDetailResponse,
  ResendNotificationResponse,
  SendNotificationRequest,
  SendNotificationResponse,
  NotificationFilters,
  PaginatedUserNotificationStatsResponse,
  // SMS types
  SmsSettings,
  SmsSettingsCreate,
  SmsSettingsUpdate,
  SmsTemplate,
  SmsTemplateCreate,
  SmsTemplateUpdate,
  SmsTemplateFilters,
  SmsTemplatePreviewRequest,
  SmsTemplatePreviewResponse,
  SmsLog,
  PaginatedSmsLogsResponse,
  SmsLogsFilters,
  SmsStats,
  SendSmsRequest,
  SendSmsResponse,
  SendBulkSmsRequest,
  SendBulkSmsResponse,
  TestSmsRequest,
  TestSmsResponse,
  // Evaluation SMS Config types
  EvaluationSmsConfig,
  EvaluationSmsConfigCreate,
  EvaluationSmsConfigUpdate,
  TaskSubjectBrief,
  // Voice/Call Center types
  VoiceSettings,
  VoiceSettingsCreate,
  VoiceSettingsUpdate,
  CallQueue,
  CallQueueCreate,
  CallQueueUpdate,
  QueueAgent,
  QueueAgentAdd,
  AgentStatus,
  AgentStatusEnum,
  CallLog,
  CallLogFilters,
  PaginatedCallLogsResponse,
  CallDetail,
  CallCallback,
  CallbackCreate,
  CallbackUpdate,
  CallbackFilters,
  PaginatedCallbacksResponse,
  DialRequest,
  CallInitiateResponse,
  WebRTCConfig,
  CallCenterStats,
  QueueStats,
  AgentStats,
} from "../../types";

/**
 * Queue for requests that are waiting for token refresh
 */
interface QueuedRequest {
  resolve: (value: AxiosResponse) => void;
  reject: (error: unknown) => void;
  config: InternalAxiosRequestConfig;
}

/**
 * API Client class with automatic token refresh
 */
class APIClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshQueue: QueuedRequest[] = [];

  constructor() {
    // Create axios instance
    this.client = axios.create({
      baseURL: `${config.api.baseUrl}/api/${config.api.version}`,
      timeout: config.api.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Request interceptor: Inject Bearer token
   */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getStoredAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Response interceptor: Handle errors with appropriate user feedback
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle network errors (no response from server)
        if (!error.response) {
          // Network error or server unreachable
          if (typeof window !== "undefined" && !originalRequest._retry) {
            const currentPath = window.location.pathname;
            if (currentPath !== "/auth/signin") {
              const redirectParam = `&redirect=${encodeURIComponent(currentPath)}`;
              window.location.href = `/auth/signin?error=network${redirectParam}`;
            }
          }
          return Promise.reject(error);
        }

        // Handle 5xx server errors - let components handle these, don't redirect
        if (error.response?.status >= 500) {
          console.error("Server error:", error.response?.data?.detail || "Unknown server error");
          return Promise.reject(error);
        }

        // If error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Token refresh in progress, queue this request
            return new Promise((resolve, reject) => {
              this.refreshQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt token refresh
            const newAccessToken = await this.refreshAccessToken();

            // Update token in original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            // Process queued requests with new token
            this.processQueue(null, newAccessToken);

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear auth and reject all queued requests
            this.processQueue(refreshError, null);
            this.clearAuth();

            // Redirect to sign in page with session expired indicator
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              const redirectParam =
                currentPath !== "/auth/signin"
                  ? `&redirect=${encodeURIComponent(currentPath)}`
                  : "";
              window.location.href = `/auth/signin?error=session_expired${redirectParam}`;
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: unknown, token: string | null): void {
    this.refreshQueue.forEach((request) => {
      if (error) {
        request.reject(error);
      } else {
        // Update token in queued request
        if (request.config.headers && token) {
          request.config.headers.Authorization = `Bearer ${token}`;
        }
        // Await the axios request promise before resolving
        this.client(request.config)
          .then((response) => request.resolve(response))
          .catch((err) => request.reject(err));
      }
    });

    this.refreshQueue = [];
  }

  /**
   * Get stored access token from localStorage
   */
  private getStoredAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get stored refresh token from localStorage
   */
  private getStoredRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getStoredRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    // Call refresh endpoint
    const response = await axios.post<TokenResponse>(getAPIUrl("auth/refresh"), {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Store new tokens
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, access_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      const expiry = calculateTokenExpiry(expires_in);
      localStorage.setItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, expiry.toString());
    }

    return access_token;
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (typeof window === "undefined") return;

    // Clear all localStorage auth keys
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);

    // Clear the auth cookie (set expired date)
    document.cookie =
      "earthenable_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  /**
   * Authenticate with Google token
   */
  async authenticateWithGoogle(googleToken: string): Promise<ExtendedTokenResponse> {
    const payload: GoogleAuthRequest = { token: googleToken };
    return this.post<ExtendedTokenResponse>("auth/google", payload);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>("auth/me");
  }

  /**
   * Sign out (revoke token)
   */
  async signOut(): Promise<void> {
    try {
      await this.post("auth/signout");
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Select entity (switch entity context)
   * Returns new tokens with selected_entity_id embedded
   */
  async selectEntity(
    entityId: string
  ): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    const response = await this.post<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }>("auth/select-entity", { entity_id: entityId });
    return response;
  }

  // ============================================================================
  // USER MANAGEMENT (Admin only)
  // ============================================================================

  /**
   * Get paginated list of users with optional filters
   */
  async getUsers(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    role?: string;
    is_active?: boolean;
  }): Promise<PaginatedUsersResponse> {
    return this.get<PaginatedUsersResponse>("/admin/users", { params });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserWithEmployeeDetail> {
    return this.get<UserWithEmployeeDetail>(`/admin/users/${userId}`);
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<User> {
    return this.patch<User>(`/admin/users/${userId}/role`, { role });
  }

  /**
   * Update user active status
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    return this.patch<User>(`/admin/users/${userId}/status`, {
      is_active: isActive,
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<UserStatsResponse> {
    return this.get<UserStatsResponse>("/admin/users/stats");
  }

  // ============================================================================
  // EMPLOYEE MANAGEMENT (Admin only)
  // ============================================================================

  /**
   * Create an employee record for an existing user
   */
  async createEmployee(userId: string, data: CreateEmployeeRequest): Promise<EmployeeDetail> {
    return this.post<EmployeeDetail>(`/admin/users/${userId}/employee`, data);
  }

  /**
   * Update current employee record
   */
  async updateEmployee(userId: string, data: UpdateEmployeeRequest): Promise<EmployeeDetail> {
    return this.patch<EmployeeDetail>(`/admin/users/${userId}/employee`, data);
  }

  /**
   * Get employment history for a user (all records, current and past)
   */
  async getEmployeeHistory(userId: string): Promise<EmployeeDetail[]> {
    return this.get<EmployeeDetail[]>(`/admin/users/${userId}/employee-history`);
  }

  /**
   * End current employee assignment (without creating a new one)
   */
  async endEmployee(userId: string, data: EndEmployeeRequest): Promise<EmployeeDetail> {
    return this.patch<EmployeeDetail>(`/admin/users/${userId}/employee/end`, data);
  }

  /**
   * Get departments for an entity (for cascading dropdown)
   */
  async getEntityDepartments(entityId: string): Promise<DepartmentResponse[]> {
    const response = await this.get<{ departments: DepartmentResponse[] }>(
      `/admin/entities/${entityId}/departments`
    );
    return response.departments;
  }

  /**
   * Get branches for an entity (for cascading dropdown)
   */
  async getEntityBranches(entityId: string): Promise<BranchResponse[]> {
    const response = await this.get<{ branches: BranchResponse[] }>(
      `/admin/entities/${entityId}/branches`
    );
    return response.branches;
  }

  /**
   * Get job roles for an entity (for cascading dropdown)
   */
  async getEntityJobRoles(entityId: string): Promise<JobRoleResponse[]> {
    const response = await this.get<{ job_roles: JobRoleResponse[] }>(
      `/admin/entities/${entityId}/job-roles`
    );
    return response.job_roles;
  }

  // ============================================================================
  // TASK SUBJECTS (Admin only)
  // ============================================================================

  /**
   * Get paginated list of task subjects with optional filters
   */
  async getTaskSubjects(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedTaskSubjectsResponse> {
    return this.get<PaginatedTaskSubjectsResponse>("/admin/task-subjects", { params });
  }

  /**
   * Create a new task subject
   */
  async createTaskSubject(data: CreateTaskSubject): Promise<TaskSubject> {
    return this.post<TaskSubject>("/admin/task-subjects", data);
  }

  // ============================================================================
  // FORM MANAGEMENT (Admin only)
  // ============================================================================

  /**
   * Get paginated list of form mappings with optional filters
   */
  async getFormMappings(params?: {
    skip?: number;
    limit?: number;
    country_code?: string;
    task_subject_id?: string;
  }): Promise<PaginatedFormMappingsResponse> {
    return this.get<PaginatedFormMappingsResponse>("/admin/forms/mappings", { params });
  }

  /**
   * Create a new form mapping
   */
  async createFormMapping(data: CreateFormMapping): Promise<TaskSubjectForm> {
    return this.post<TaskSubjectForm>("/admin/forms/mappings", data);
  }

  /**
   * Update form mapping
   */
  async updateFormMapping(mappingId: string, data: UpdateFormMapping): Promise<TaskSubjectForm> {
    return this.patch<TaskSubjectForm>(`/admin/forms/mappings/${mappingId}`, data);
  }

  // ============================================================================
  // ENTITY ACCESS MANAGEMENT (Admin only)
  // ============================================================================

  /**
   * List all users with their entity access information
   */
  async getUsersWithEntityAccess(params?: {
    search?: string;
    entity_id?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<PaginatedUserEntityAccessResponse> {
    return this.get<PaginatedUserEntityAccessResponse>("/admin/users/entity-access", { params });
  }

  /**
   * Get user's entity access details
   */
  async getUserEntityAccess(userId: string): Promise<UserWithEntityAccess> {
    return this.get<UserWithEntityAccess>(`/admin/users/${userId}/entity-access`);
  }

  /**
   * Grant entity access to a user
   */
  async grantEntityAccess(
    userId: string,
    request: GrantEntityAccessRequest
  ): Promise<EntityAccessResponse> {
    return this.post<EntityAccessResponse>(`/admin/users/${userId}/entity-access`, request);
  }

  /**
   * Grant multiple entities to a user (bulk operation)
   */
  async bulkGrantEntityAccess(
    userId: string,
    request: BulkGrantEntityAccessRequest
  ): Promise<EntityAccessResponse[]> {
    return this.post<EntityAccessResponse[]>(`/admin/users/${userId}/entity-access/bulk`, request);
  }

  /**
   * Revoke entity access from a user
   */
  async revokeEntityAccess(userId: string, entityId: string): Promise<void> {
    return this.delete<void>(`/admin/users/${userId}/entity-access/${entityId}`);
  }

  /**
   * List all entities with user counts
   */
  async getEntitiesForAdmin(includeInactive = false): Promise<EntityListResponse[]> {
    return this.get<EntityListResponse[]>("/admin/entities/list", {
      params: { include_inactive: includeInactive },
    });
  }

  // ============================================================================
  // TASK MANAGEMENT (Admin only)
  // ============================================================================

  /**
   * Get paginated list of tasks with optional filters
   * Supports both single values and arrays (converted to comma-separated strings)
   */
  async getTasks(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    status?: string | string[];
    subject_id?: string | string[];
    assignee_id?: string | string[];
    priority?: string | string[];
    due_time?: string | string[];
    type?: string | string[];
    country?: string | string[];
    district?: string | string[];
    sector?: string | string[];
    cell?: string | string[];
    village?: string | string[];
    has_open_cases?: boolean;
  }): Promise<PaginatedTasksResponse> {
    // Convert arrays to comma-separated strings for API
    const processedParams = params ? this.processArrayParams(params) : undefined;
    return this.get<PaginatedTasksResponse>("/admin/tasks", { params: processedParams });
  }

  /**
   * Get task statistics with optional filters
   * Supports both single values and arrays (converted to comma-separated strings)
   */
  async getTaskStats(params?: {
    search?: string;
    status?: string | string[];
    subject_id?: string | string[];
    assignee_id?: string | string[];
    priority?: string | string[];
    type?: string | string[];
    country?: string | string[];
    district?: string | string[];
    sector?: string | string[];
    cell?: string | string[];
    village?: string | string[];
    has_open_cases?: boolean;
  }): Promise<TaskStatsResponse> {
    // Convert arrays to comma-separated strings for API
    const processedParams = params ? this.processArrayParams(params) : undefined;
    return this.get<TaskStatsResponse>("/admin/tasks/stats", { params: processedParams });
  }

  /**
   * Helper to convert array parameters to comma-separated strings
   */
  private processArrayParams(params: Record<string, unknown>): Record<string, unknown> {
    const processed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        // Only include if array has values
        if (value.length > 0) {
          processed[key] = value.join(",");
        }
      } else if (value !== undefined && value !== null && value !== "") {
        processed[key] = value;
      }
    }
    return processed;
  }

  /**
   * Get unique location values for filter dropdowns
   */
  async getLocationValues(params?: {
    country?: string;
    district?: string;
    sector?: string;
    cell?: string;
  }): Promise<LocationValuesResponse> {
    return this.get<LocationValuesResponse>("/admin/tasks/locations", { params });
  }

  /**
   * Get list of users that can be assigned tasks
   */
  async getAssignableUsers(): Promise<TaskAssignee[]> {
    return this.get<TaskAssignee[]>("/admin/tasks/assignable-users");
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<TaskDetail> {
    return this.get<TaskDetail>(`/admin/tasks/${taskId}`);
  }

  /**
   * Get complete task details with all related entities
   * Used for task detail modal/page
   */
  async getTaskComplete(taskId: string): Promise<TaskCompleteResponse> {
    return this.get<TaskCompleteResponse>(`/admin/tasks/${taskId}/complete`);
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<TaskDetail> {
    return this.patch<TaskDetail>(`/admin/tasks/${taskId}`, data);
  }

  /**
   * Reassign task to a different user
   */
  async reassignTask(taskId: string, data: ReassignTaskRequest): Promise<TaskDetail> {
    return this.post<TaskDetail>(`/admin/tasks/${taskId}/reassign`, data);
  }

  /**
   * Bulk reassign multiple tasks
   */
  async bulkReassignTasks(data: BulkReassignTasksRequest): Promise<BulkReassignResponse> {
    return this.post<BulkReassignResponse>("/admin/tasks/bulk-reassign", data);
  }

  /**
   * Soft delete a task (sets is_deleted = true)
   * Creates visibility log entries to notify mobile apps to remove the task
   */
  async deleteTask(
    taskId: string
  ): Promise<{ message: string; task_id: string; task_subject?: string }> {
    return this.delete<{ message: string; task_id: string; task_subject?: string }>(
      `/admin/tasks/${taskId}`
    );
  }

  /**
   * Bulk soft delete multiple tasks
   */
  async bulkDeleteTasks(taskIds: string[]): Promise<{ message: string; deleted_count: number }> {
    return this.post<{ message: string; deleted_count: number }>("/admin/tasks/bulk-delete", {
      task_ids: taskIds,
    });
  }

  /**
   * Update task status (single task)
   */
  async updateTaskStatus(taskId: string, status: string): Promise<TaskDetail> {
    return this.patch<TaskDetail>(`/admin/tasks/${taskId}`, { status });
  }

  /**
   * Bulk update status for multiple tasks
   */
  async bulkUpdateTaskStatus(
    taskIds: string[],
    status: string
  ): Promise<{ message: string; updated_count: number; new_status: string }> {
    return this.post<{ message: string; updated_count: number; new_status: string }>(
      "/admin/tasks/bulk-update-status",
      { task_ids: taskIds, status }
    );
  }

  // ============================================================================
  // ORG HIERARCHY / PERMISSION MANAGEMENT (Admin only)
  // ============================================================================

  /**
   * Get available org roles with their permissions
   */
  async getOrgRoles(): Promise<OrgRoleOption[]> {
    return this.get<OrgRoleOption[]>("/admin/org-hierarchy/roles");
  }

  /**
   * Get paginated list of org hierarchy entries
   */
  async getOrgHierarchyEntries(params?: {
    skip?: number;
    limit?: number;
    user_id?: string;
    department_id?: string;
    role?: string;
    is_active?: boolean;
  }): Promise<PaginatedOrgHierarchyResponse> {
    return this.get<PaginatedOrgHierarchyResponse>("/admin/org-hierarchy", { params });
  }

  /**
   * Get a specific org hierarchy entry
   */
  async getOrgHierarchyEntry(entryId: string): Promise<OrgHierarchyEntry> {
    return this.get<OrgHierarchyEntry>(`/admin/org-hierarchy/${entryId}`);
  }

  /**
   * Get a user's org hierarchy entries
   */
  async getUserOrgHierarchy(userId: string): Promise<OrgHierarchyEntry[]> {
    return this.get<OrgHierarchyEntry[]>(`/admin/users/${userId}/org-hierarchy`);
  }

  /**
   * Create a new org hierarchy entry
   */
  async createOrgHierarchyEntry(data: CreateOrgHierarchyRequest): Promise<OrgHierarchyEntry> {
    return this.post<OrgHierarchyEntry>("/admin/org-hierarchy", data);
  }

  /**
   * Update an org hierarchy entry
   */
  async updateOrgHierarchyEntry(
    entryId: string,
    data: UpdateOrgHierarchyRequest
  ): Promise<OrgHierarchyEntry> {
    return this.patch<OrgHierarchyEntry>(`/admin/org-hierarchy/${entryId}`, data);
  }

  /**
   * Delete an org hierarchy entry
   */
  async deleteOrgHierarchyEntry(entryId: string): Promise<void> {
    return this.delete<void>(`/admin/org-hierarchy/${entryId}`);
  }

  // ============================================================================
  // ROLE PERMISSION MAPPINGS (Admin only)
  // ============================================================================

  /**
   * Get available permission tiers
   */
  async getPermissionTiers(): Promise<PermissionTiersResponse> {
    return this.get<PermissionTiersResponse>("/admin/role-permissions/tiers");
  }

  /**
   * Get all role permission mappings
   */
  async getRolePermissionMappings(params?: {
    permission_tier?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<RolePermissionMappingListResponse> {
    return this.get<RolePermissionMappingListResponse>("/admin/role-permissions", { params });
  }

  /**
   * Get a specific role permission mapping
   */
  async getRolePermissionMapping(mappingId: string): Promise<RolePermissionMapping> {
    return this.get<RolePermissionMapping>(`/admin/role-permissions/${mappingId}`);
  }

  /**
   * Create a new role permission mapping
   */
  async createRolePermissionMapping(
    data: CreateRolePermissionMappingRequest
  ): Promise<RolePermissionMapping> {
    return this.post<RolePermissionMapping>("/admin/role-permissions", data);
  }

  /**
   * Update a role permission mapping
   */
  async updateRolePermissionMapping(
    mappingId: string,
    data: UpdateRolePermissionMappingRequest
  ): Promise<RolePermissionMapping> {
    return this.patch<RolePermissionMapping>(`/admin/role-permissions/${mappingId}`, data);
  }

  /**
   * Delete a role permission mapping
   */
  async deleteRolePermissionMapping(mappingId: string): Promise<void> {
    return this.delete<void>(`/admin/role-permissions/${mappingId}`);
  }

  // ============================================================================
  // SERVER MONITORING (Admin only)
  // ============================================================================

  /**
   * Get server health status including database, Redis, and Salesforce connections
   */
  async getMonitoringHealth(): Promise<ServerHealthResponse> {
    return this.get<ServerHealthResponse>("/admin/monitoring/health");
  }

  /**
   * Get Salesforce sync status and history
   */
  async getMonitoringSyncStatus(limit = 10): Promise<SalesforceSyncStatusResponse> {
    return this.get<SalesforceSyncStatusResponse>("/admin/monitoring/salesforce-sync", {
      params: { limit },
    });
  }

  /**
   * Get user activity statistics
   */
  async getMonitoringUserActivity(): Promise<UserActivityStatsResponse> {
    return this.get<UserActivityStatsResponse>("/admin/monitoring/user-activity");
  }

  /**
   * Get feature usage statistics
   */
  async getMonitoringFeatureUsage(days = 7): Promise<FeatureUsageResponse> {
    return this.get<FeatureUsageResponse>("/admin/monitoring/feature-usage", {
      params: { days },
    });
  }

  /**
   * Get system resource utilization (CPU, memory, disk)
   */
  async getMonitoringResources(): Promise<SystemResourcesResponse> {
    return this.get<SystemResourcesResponse>("/admin/monitoring/resources");
  }

  /**
   * Get API endpoint usage statistics
   */
  async getMonitoringEndpointUsage(days = 7): Promise<EndpointUsageResponse> {
    return this.get<EndpointUsageResponse>("/admin/monitoring/endpoint-usage", {
      params: { days },
    });
  }

  /**
   * Get hierarchical feature usage breakdown (Category > Screen > Action)
   * @param days - Number of days to analyze
   * @param category - Filter by event category
   * @param role - Filter by user role
   * @param userId - Filter by specific user ID
   */
  async getHierarchicalFeatureUsage(
    days = 7,
    category?: string,
    role?: string,
    userId?: string
  ): Promise<HierarchicalFeatureUsageResponse> {
    return this.get<HierarchicalFeatureUsageResponse>(
      "/admin/monitoring/feature-usage/hierarchical",
      {
        params: { days, category, role, user_id: userId },
      }
    );
  }

  /**
   * Get paginated activity timeline for a specific user
   */
  async getUserActivityTimeline(
    userId: string,
    page = 1,
    pageSize = 50,
    category?: string,
    days?: number
  ): Promise<PaginatedActivityResponse> {
    return this.get<PaginatedActivityResponse>(`/admin/monitoring/users/${userId}/activity`, {
      params: { page, page_size: pageSize, category, days },
    });
  }

  /**
   * Get users who used a specific feature
   */
  async getFeatureUsers(feature: string, days = 7): Promise<FeatureUsersResponse> {
    return this.get<FeatureUsersResponse>(
      `/admin/monitoring/feature-usage/${encodeURIComponent(feature)}/users`,
      {
        params: { days },
      }
    );
  }

  /**
   * Get platform and device analytics
   * @param days - Number of days to analyze
   */
  async getPlatformAnalytics(days = 7): Promise<PlatformAnalyticsResponse> {
    return this.get<PlatformAnalyticsResponse>("/admin/monitoring/platform-analytics", {
      params: { days },
    });
  }

  /**
   * Get users who have actively used the app
   */
  async getActiveAppUsers(): Promise<ActiveAppUsersResponse> {
    return this.get<ActiveAppUsersResponse>("/admin/monitoring/active-users");
  }

  /**
   * Get daily activity statistics for time series charts
   * @param days - Number of days to analyze (1-90, default 30)
   */
  async getActivityTimeSeries(days = 30): Promise<ActivityTimeSeriesResponse> {
    return this.get<ActivityTimeSeriesResponse>("/admin/monitoring/activity-time-series", {
      params: { days },
    });
  }

  /**
   * Get user login frequency statistics
   * @param days - Number of days to analyze (default 7)
   * @param period - Period filter: 'today', 'yesterday', 'week', 'month', 'all'
   * @param limit - Maximum users to return (default 50)
   */
  async getLoginFrequency(
    days = 7,
    period?: string,
    limit = 50
  ): Promise<UserLoginFrequencyResponse> {
    return this.get<UserLoginFrequencyResponse>("/admin/monitoring/login-frequency", {
      params: { days, period, limit },
    });
  }

  // =========================================================================
  // Salesforce Sync Endpoints
  // =========================================================================

  /**
   * Get detailed Salesforce sync history with pagination
   */
  async getSalesforceSyncHistory(
    page = 1,
    pageSize = 20,
    status?: string,
    syncType?: string,
    days?: number
  ): Promise<SalesforceSyncHistoryResponse> {
    return this.get<SalesforceSyncHistoryResponse>("/admin/monitoring/salesforce-sync/history", {
      params: {
        page,
        page_size: pageSize,
        status,
        sync_type: syncType,
        days,
      },
    });
  }

  /**
   * Get aggregated Salesforce sync statistics
   */
  async getSalesforceSyncStats(days = 7): Promise<SalesforceSyncStatsResponse> {
    return this.get<SalesforceSyncStatsResponse>("/admin/monitoring/salesforce-sync/stats", {
      params: { days },
    });
  }

  // =========================================================================
  // User Sync Endpoints
  // =========================================================================

  /**
   * Get user sync sessions history with pagination
   */
  async getUserSyncSessions(
    page = 1,
    pageSize = 20,
    userId?: string,
    syncType?: string,
    success?: boolean,
    days?: number
  ): Promise<UserSyncSessionsResponse> {
    return this.get<UserSyncSessionsResponse>("/admin/monitoring/user-sync/sessions", {
      params: {
        page,
        page_size: pageSize,
        user_id: userId,
        sync_type: syncType,
        success,
        days,
      },
    });
  }

  /**
   * Get user sync states with pagination
   */
  async getUserSyncStates(
    page = 1,
    pageSize = 20,
    userId?: string,
    role?: string,
    forceFullSync?: boolean
  ): Promise<UserSyncStatesResponse> {
    return this.get<UserSyncStatesResponse>("/admin/monitoring/user-sync/states", {
      params: {
        page,
        page_size: pageSize,
        user_id: userId,
        role,
        force_full_sync: forceFullSync,
      },
    });
  }

  /**
   * Get aggregated user sync statistics
   */
  async getUserSyncStats(days = 7): Promise<UserSyncStatsResponse> {
    return this.get<UserSyncStatsResponse>("/admin/monitoring/user-sync/stats", {
      params: { days },
    });
  }

  // =========================================================================
  // Notification Management Endpoints (Admin only)
  // =========================================================================

  /**
   * Get paginated list of notifications with optional filters
   */
  async getNotifications(filters?: NotificationFilters): Promise<PaginatedNotificationsResponse> {
    // Build query params from filters
    const params: Record<string, unknown> = {};

    if (filters) {
      if (filters.skip !== undefined) params.skip = filters.skip;
      if (filters.limit !== undefined) params.limit = filters.limit;
      if (filters.user_id) params.user_id = filters.user_id;
      if (filters.search) params.search = filters.search;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      // Convert notification types array to comma-separated string
      if (filters.notification_types && filters.notification_types.length > 0) {
        params.notification_types = filters.notification_types.join(",");
      }

      // Convert status filter to is_sent/is_read params
      if (filters.status && filters.status !== "all") {
        switch (filters.status) {
          case "pending":
            params.is_sent = false;
            break;
          case "sent":
            params.is_sent = true;
            params.is_read = false;
            break;
          case "read":
            params.is_sent = true;
            params.is_read = true;
            break;
        }
      }
    }

    return this.get<PaginatedNotificationsResponse>("/admin/notifications", { params });
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(days = 7): Promise<NotificationStatsResponse> {
    return this.get<NotificationStatsResponse>("/admin/notifications/stats", {
      params: { days },
    });
  }

  /**
   * Get notification statistics grouped by user
   */
  async getNotificationsByUser(params?: {
    skip?: number;
    limit?: number;
    search?: string;
    days?: number;
  }): Promise<PaginatedUserNotificationStatsResponse> {
    return this.get<PaginatedUserNotificationStatsResponse>("/admin/notifications/by-user", {
      params,
    });
  }

  /**
   * Get notification detail by ID
   */
  async getNotificationById(notificationId: string): Promise<NotificationDetailResponse> {
    return this.get<NotificationDetailResponse>(`/admin/notifications/${notificationId}`);
  }

  /**
   * Resend a failed or pending notification
   */
  async resendNotification(notificationId: string): Promise<ResendNotificationResponse> {
    return this.post<ResendNotificationResponse>(`/admin/notifications/${notificationId}/resend`);
  }

  /**
   * Send a custom notification to one or more users
   */
  async sendNotification(request: SendNotificationRequest): Promise<SendNotificationResponse> {
    return this.post<SendNotificationResponse>("/admin/notifications/send", request);
  }

  // ============================================================================
  // SMS MANAGEMENT (Admin only)
  // ============================================================================

  /**
   * Get SMS settings for an entity
   */
  async getSmsSettings(entityId: string): Promise<SmsSettings | null> {
    return this.get<SmsSettings | null>(`/admin/sms/settings/${entityId}`);
  }

  /**
   * Create SMS settings for an entity
   */
  async createSmsSettings(data: SmsSettingsCreate): Promise<SmsSettings> {
    return this.post<SmsSettings>("/admin/sms/settings", data);
  }

  /**
   * Update SMS settings for an entity
   */
  async updateSmsSettings(entityId: string, data: SmsSettingsUpdate): Promise<SmsSettings> {
    return this.put<SmsSettings>(`/admin/sms/settings/${entityId}`, data);
  }

  /**
   * Test SMS settings by sending a test message
   */
  async testSmsSettings(entityId: string, data: TestSmsRequest): Promise<TestSmsResponse> {
    return this.post<TestSmsResponse>(`/admin/sms/settings/${entityId}/test`, data);
  }

  /**
   * List SMS templates with optional filters
   */
  async getSmsTemplates(filters?: SmsTemplateFilters): Promise<SmsTemplate[]> {
    return this.get<SmsTemplate[]>("/admin/sms/templates", { params: filters });
  }

  /**
   * Get a specific SMS template
   */
  async getSmsTemplate(templateId: string): Promise<SmsTemplate> {
    return this.get<SmsTemplate>(`/admin/sms/templates/${templateId}`);
  }

  /**
   * Create a new SMS template
   */
  async createSmsTemplate(data: SmsTemplateCreate): Promise<SmsTemplate> {
    return this.post<SmsTemplate>("/admin/sms/templates", data);
  }

  /**
   * Update an SMS template
   */
  async updateSmsTemplate(templateId: string, data: SmsTemplateUpdate): Promise<SmsTemplate> {
    return this.put<SmsTemplate>(`/admin/sms/templates/${templateId}`, data);
  }

  /**
   * Delete an SMS template
   */
  async deleteSmsTemplate(templateId: string): Promise<void> {
    return this.delete<void>(`/admin/sms/templates/${templateId}`);
  }

  /**
   * Preview an SMS template with sample variables
   */
  async previewSmsTemplate(
    templateId: string,
    data: SmsTemplatePreviewRequest
  ): Promise<SmsTemplatePreviewResponse> {
    return this.post<SmsTemplatePreviewResponse>(
      `/admin/sms/templates/${templateId}/preview`,
      data
    );
  }

  /**
   * Get SMS logs with pagination and filters
   */
  async getSmsLogs(filters?: SmsLogsFilters): Promise<PaginatedSmsLogsResponse> {
    return this.get<PaginatedSmsLogsResponse>("/admin/sms/logs", { params: filters });
  }

  /**
   * Get a specific SMS log entry
   */
  async getSmsLog(logId: string): Promise<SmsLog> {
    return this.get<SmsLog>(`/admin/sms/logs/${logId}`);
  }

  /**
   * Get SMS statistics for an entity
   */
  async getSmsStats(entityId: string, days: number = 30): Promise<SmsStats> {
    return this.get<SmsStats>("/admin/sms/stats", { params: { entity_id: entityId, days } });
  }

  /**
   * Send an SMS (templated or raw)
   */
  async sendSms(data: SendSmsRequest): Promise<SendSmsResponse> {
    return this.post<SendSmsResponse>("/admin/sms/send", data);
  }

  /**
   * Send bulk SMS using a template
   */
  async sendBulkSms(data: SendBulkSmsRequest): Promise<SendBulkSmsResponse> {
    return this.post<SendBulkSmsResponse>("/admin/sms/send-bulk", data);
  }

  // ==================== Evaluation SMS Config Methods ====================

  async getEvaluationSmsConfigs(filters?: {
    entity_id?: string;
    task_subject_id?: string;
    is_enabled?: boolean;
  }): Promise<EvaluationSmsConfig[]> {
    const params = new URLSearchParams();
    if (filters?.entity_id) params.append("entity_id", filters.entity_id);
    if (filters?.task_subject_id) params.append("task_subject_id", filters.task_subject_id);
    if (filters?.is_enabled !== undefined) params.append("is_enabled", String(filters.is_enabled));

    const queryString = params.toString();
    return this.get<EvaluationSmsConfig[]>(
      `/admin/sms/evaluation-configs${queryString ? `?${queryString}` : ""}`
    );
  }

  async getEvaluationSmsConfig(configId: string): Promise<EvaluationSmsConfig> {
    return this.get<EvaluationSmsConfig>(`/admin/sms/evaluation-configs/${configId}`);
  }

  async createEvaluationSmsConfig(data: EvaluationSmsConfigCreate): Promise<EvaluationSmsConfig> {
    return this.post<EvaluationSmsConfig>("/admin/sms/evaluation-configs", data);
  }

  async updateEvaluationSmsConfig(
    configId: string,
    data: EvaluationSmsConfigUpdate
  ): Promise<EvaluationSmsConfig> {
    return this.put<EvaluationSmsConfig>(`/admin/sms/evaluation-configs/${configId}`, data);
  }

  async deleteEvaluationSmsConfig(configId: string): Promise<void> {
    return this.delete<void>(`/admin/sms/evaluation-configs/${configId}`);
  }

  async getTaskSubjectsForSms(): Promise<TaskSubjectBrief[]> {
    return this.get<TaskSubjectBrief[]>("/admin/sms/task-subjects");
  }

  // ============================================================================
  // VOICE/CALL CENTER MANAGEMENT
  // ============================================================================

  // ==================== Voice Settings ====================

  /**
   * Get voice settings for an entity
   */
  async getVoiceSettings(entityId: string): Promise<VoiceSettings | null> {
    return this.get<VoiceSettings | null>(`/admin/voice/settings/${entityId}`);
  }

  /**
   * Create voice settings for an entity
   */
  async createVoiceSettings(data: VoiceSettingsCreate): Promise<VoiceSettings> {
    return this.post<VoiceSettings>("/admin/voice/settings", data);
  }

  /**
   * Update voice settings for an entity
   */
  async updateVoiceSettings(entityId: string, data: VoiceSettingsUpdate): Promise<VoiceSettings> {
    return this.put<VoiceSettings>(`/admin/voice/settings/${entityId}`, data);
  }

  /**
   * Test voice settings by making a test call
   */
  async testVoiceSettings(
    entityId: string,
    phoneNumber: string
  ): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(
      `/admin/voice/settings/${entityId}/test`,
      { phone_number: phoneNumber }
    );
  }

  // ==================== Call Queues ====================

  /**
   * Get all call queues for an entity
   */
  async getCallQueues(filters?: { entity_id?: string; is_active?: boolean }): Promise<CallQueue[]> {
    return this.get<CallQueue[]>("/admin/voice/queues", { params: filters });
  }

  /**
   * Get a specific call queue
   */
  async getCallQueue(queueId: string): Promise<CallQueue> {
    return this.get<CallQueue>(`/admin/voice/queues/${queueId}`);
  }

  /**
   * Create a new call queue
   */
  async createCallQueue(data: CallQueueCreate): Promise<CallQueue> {
    return this.post<CallQueue>("/admin/voice/queues", data);
  }

  /**
   * Update a call queue
   */
  async updateCallQueue(queueId: string, data: CallQueueUpdate): Promise<CallQueue> {
    return this.put<CallQueue>(`/admin/voice/queues/${queueId}`, data);
  }

  /**
   * Delete a call queue
   */
  async deleteCallQueue(queueId: string): Promise<void> {
    return this.delete<void>(`/admin/voice/queues/${queueId}`);
  }

  // ==================== Queue Agents ====================

  /**
   * Get agents assigned to a queue
   */
  async getQueueAgents(queueId: string): Promise<QueueAgent[]> {
    return this.get<QueueAgent[]>(`/admin/voice/queues/${queueId}/agents`);
  }

  /**
   * Add an agent to a queue
   */
  async addQueueAgent(queueId: string, data: QueueAgentAdd): Promise<QueueAgent> {
    return this.post<QueueAgent>(`/admin/voice/queues/${queueId}/agents`, data);
  }

  /**
   * Remove an agent from a queue
   */
  async removeQueueAgent(queueId: string, userId: string): Promise<void> {
    return this.delete<void>(`/admin/voice/queues/${queueId}/agents/${userId}`);
  }

  // ==================== Call Logs (Admin) ====================

  /**
   * Get call logs with pagination and filters
   */
  async getCallLogs(filters?: CallLogFilters): Promise<PaginatedCallLogsResponse> {
    return this.get<PaginatedCallLogsResponse>("/admin/voice/calls", { params: filters });
  }

  /**
   * Get a specific call log with full details
   */
  async getCallDetail(callId: string): Promise<CallDetail> {
    return this.get<CallDetail>(`/admin/voice/calls/${callId}`);
  }

  /**
   * Get presigned URL for call recording
   */
  async getCallRecordingUrl(callId: string): Promise<{ url: string; expires_in: number }> {
    return this.get<{ url: string; expires_in: number }>(`/admin/voice/calls/${callId}/recording`);
  }

  /**
   * Update call log notes
   */
  async updateCallNotes(callId: string, notes: string): Promise<CallLog> {
    return this.patch<CallLog>(`/admin/voice/calls/${callId}`, { notes });
  }

  // ==================== Callbacks ====================

  /**
   * Get callbacks with pagination and filters
   */
  async getCallbacks(filters?: CallbackFilters): Promise<PaginatedCallbacksResponse> {
    return this.get<PaginatedCallbacksResponse>("/admin/voice/callbacks", { params: filters });
  }

  /**
   * Get a specific callback
   */
  async getCallback(callbackId: string): Promise<CallCallback> {
    return this.get<CallCallback>(`/admin/voice/callbacks/${callbackId}`);
  }

  /**
   * Create a new callback
   */
  async createCallback(data: CallbackCreate): Promise<CallCallback> {
    return this.post<CallCallback>("/admin/voice/callbacks", data);
  }

  /**
   * Update a callback
   */
  async updateCallback(callbackId: string, data: CallbackUpdate): Promise<CallCallback> {
    return this.put<CallCallback>(`/admin/voice/callbacks/${callbackId}`, data);
  }

  /**
   * Cancel a callback
   */
  async cancelCallback(callbackId: string): Promise<void> {
    return this.delete<void>(`/admin/voice/callbacks/${callbackId}`);
  }

  // ==================== Agent Status (Admin) ====================

  /**
   * Get all agent statuses for an entity
   */
  async getAgentStatuses(entityId?: string): Promise<AgentStatus[]> {
    return this.get<AgentStatus[]>("/admin/voice/agents/status", {
      params: entityId ? { entity_id: entityId } : undefined,
    });
  }

  /**
   * Admin override of agent status
   */
  async setAgentStatus(userId: string, status: AgentStatusEnum): Promise<AgentStatus> {
    return this.put<AgentStatus>(`/admin/voice/agents/${userId}/status`, { status });
  }

  // ==================== Call Center Statistics ====================

  /**
   * Get call center statistics
   */
  async getCallCenterStats(entityId: string, days: number = 30): Promise<CallCenterStats> {
    return this.get<CallCenterStats>("/admin/voice/stats", {
      params: { entity_id: entityId, days },
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(entityId: string): Promise<QueueStats[]> {
    return this.get<QueueStats[]>("/admin/voice/stats/queues", {
      params: { entity_id: entityId },
    });
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(entityId: string, days: number = 7): Promise<AgentStats[]> {
    return this.get<AgentStats[]>("/admin/voice/stats/agents", {
      params: { entity_id: entityId, days },
    });
  }

  // ==================== Outbound Calls (Admin) ====================

  /**
   * Initiate an outbound call (admin)
   */
  async initiateCall(data: DialRequest): Promise<CallInitiateResponse> {
    return this.post<CallInitiateResponse>("/admin/voice/calls/initiate", data);
  }

  // ============================================================================
  // VOICE/CALL CENTER - AGENT ENDPOINTS (Self-service)
  // ============================================================================

  /**
   * Get current agent's status
   */
  async getMyAgentStatus(entityId: string): Promise<AgentStatus | null> {
    return this.get<AgentStatus | null>(`/voice/agent/status?entity_id=${entityId}`);
  }

  /**
   * Update current agent's status
   */
  async updateMyAgentStatus(entityId: string, status: AgentStatusEnum): Promise<AgentStatus> {
    return this.put<AgentStatus>(`/voice/agent/status?entity_id=${entityId}`, { status });
  }

  /**
   * Get queues the current agent is assigned to
   */
  async getMyQueues(entityId: string): Promise<CallQueue[]> {
    return this.get<CallQueue[]>(`/voice/agent/queues?entity_id=${entityId}`);
  }

  /**
   * Get current agent's active call
   */
  async getMyActiveCall(entityId: string): Promise<CallDetail | null> {
    return this.get<CallDetail | null>(`/voice/agent/calls/active?entity_id=${entityId}`);
  }

  /**
   * Initiate an outbound call as agent
   */
  async dialNumber(data: DialRequest): Promise<CallInitiateResponse> {
    return this.post<CallInitiateResponse>("/voice/agent/calls/dial", data);
  }

  /**
   * End the current call
   */
  async endCall(callId: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(`/voice/agent/calls/${callId}/end`);
  }

  /**
   * Put call on hold
   */
  async holdCall(callId: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(`/voice/agent/calls/${callId}/hold`);
  }

  /**
   * Resume call from hold
   */
  async resumeCall(callId: string): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(`/voice/agent/calls/${callId}/resume`);
  }

  /**
   * Transfer call to another number or queue
   */
  async transferCall(
    callId: string,
    target: string,
    transferType: "cold" | "warm" = "cold"
  ): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>(
      `/voice/agent/calls/${callId}/transfer`,
      { target, transfer_type: transferType }
    );
  }

  /**
   * Get callbacks assigned to current agent
   */
  async getMyCallbacks(entityId: string): Promise<CallCallback[]> {
    return this.get<CallCallback[]>(`/voice/agent/callbacks/mine?entity_id=${entityId}`);
  }

  /**
   * Get WebRTC configuration for browser-based calling
   */
  async getWebRTCConfig(entityId: string): Promise<WebRTCConfig> {
    return this.get<WebRTCConfig>(`/voice/agent/webrtc-config?entity_id=${entityId}`);
  }

  /**
   * Get agent's recent call history
   */
  async getMyCallHistory(entityId: string, limit: number = 20): Promise<CallLog[]> {
    return this.get<CallLog[]>(`/voice/agent/calls/history?entity_id=${entityId}`, {
      params: { limit },
    });
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new APIClient();
