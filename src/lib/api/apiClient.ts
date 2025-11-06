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
  GoogleAuthRequest,
  TOKEN_STORAGE_KEYS,
  calculateTokenExpiry,
  User,
  UserDetail,
  UserRole,
  PaginatedUsersResponse,
  UserStatsResponse,
  TaskSubjectForm,
  PaginatedFormMappingsResponse,
  UpdateFormMapping,
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
   * Response interceptor: Handle 401 with auto-refresh
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

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

            // Redirect to sign in page
            if (typeof window !== "undefined") {
              window.location.href = "/auth/signin";
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

    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
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
  async authenticateWithGoogle(googleToken: string): Promise<TokenResponse> {
    const payload: GoogleAuthRequest = { token: googleToken };
    return this.post<TokenResponse>("auth/google", payload);
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
  async getUserById(userId: string): Promise<UserDetail> {
    return this.get<UserDetail>(`/admin/users/${userId}`);
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: UserRole): Promise<User> {
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
   * Update form mapping
   */
  async updateFormMapping(mappingId: string, data: UpdateFormMapping): Promise<TaskSubjectForm> {
    return this.patch<TaskSubjectForm>(`/admin/forms/mappings/${mappingId}`, data);
  }
}

/**
 * Singleton API client instance
 */
export const apiClient = new APIClient();
