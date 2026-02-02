/**
 * Expense API Client
 *
 * Methods for interacting with expense management endpoints
 */

import { apiClient } from "./apiClient";

export interface Expense {
  id: string;
  entity_id: string;
  department_id: string;
  submitter_id: string;
  category_id: string;
  // May come as snake_case or camelCase due to backend aliases
  expense_type?: "expense" | "per_diem" | "advance";
  expenseType?: "expense" | "per_diem" | "advance";
  title: string;
  amount: number;
  currency: string;
  expense_date?: string;
  expenseDate?: string;
  description?: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  // Joined fields (may come as snake_case or camelCase due to backend aliases)
  submitter_name?: string;
  submitterName?: string;
  department_name?: string;
  departmentName?: string;
  category_name?: string;
  categoryName?: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExpenseSummary {
  total_count: number;
  total_amount: number;
  draft_count: number;
  submitted_count: number;
  approved_count: number;
  rejected_count: number;
  paid_count: number;
}

export interface Department {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  budget_limit?: number;
  is_active: boolean;
  gl_code?: string;
  gl_class_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  location?: string;
  is_active: boolean;
  gl_code?: string;
  gl_class_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  description?: string;
  requires_receipt: boolean;
  is_active: boolean;
  gl_code?: string;
  gl_class_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PerDiemCalculation {
  designation: string;
  days: number;
  rate_per_day: number;
  total_amount: number;
  currency: string;
}

export interface Budget {
  id: string;
  entity_id: string;
  department_id: string;
  category_id: string;
  budget_amount: number;
  spent_amount: number;
  period: string;
  start_date: string;
  end_date: string;
  fiscal_year: number;
  department_name?: string;
  category_name?: string;
}

export interface PerDiemRate {
  id: string;
  entity_id: string;
  designation: string;
  rate_per_day: number;
  currency: string;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  name: string;
  code: string;
  country_code: string;
  currency: string;
  is_active: boolean;
  quickbooks_company_id?: string;
  quickbooks_realm_id?: string;
  quickbooks_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobRole {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  level: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== Approval Types ====================

export interface ApprovalStep {
  id: string;
  stepOrder: number;
  approverId: string;
  approverName?: string;
  approverRole?: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ExpenseWithApprovals {
  success: boolean;
  expense: Expense;
  submitterName?: string;
  departmentName?: string;
  categoryName?: string;
  approvals: ApprovalStep[];
  currentStep?: number;
  totalSteps: number;
  canApprove: boolean;
  canReject: boolean;
}

export interface PendingApprovalItem {
  approvalId: string;
  expenseId: string;
  expenseTitle: string;
  expenseAmount: number;
  expenseCurrency: string;
  expenseDate: string;
  expenseType: "expense" | "per_diem" | "advance";
  submitterId: string;
  submitterName?: string;
  departmentName?: string;
  stepOrder: number;
  totalSteps: number;
  submittedAt?: string;
}

export interface PendingApprovalsResponse {
  success: boolean;
  approvals: PendingApprovalItem[];
  totalCount: number;
}

export interface ApprovalActionResponse {
  success: boolean;
  message: string;
  expenseId: string;
  expenseStatus: string;
  stepOrder: number;
  action: "approved" | "rejected";
}

/**
 * Fetch expense summary statistics
 */
export async function getExpenseSummary(
  entityId: string,
  departmentId?: string
): Promise<ExpenseSummary> {
  let url = `/expenses/summary/${entityId}`;
  const params = new URLSearchParams();

  if (departmentId) params.append("department_id", departmentId);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await apiClient.get<ExpenseSummary>(url);
  return response;
}

/**
 * List expenses with optional filtering
 */
export async function listExpenses(params: {
  entityId?: string;
  departmentId?: string;
  submitterId?: string;
  statusFilter?: string;
  page?: number;
  pageSize?: number;
}): Promise<ExpenseListResponse> {
  const queryParams = new URLSearchParams();

  if (params.entityId) queryParams.append("entity_id", params.entityId);
  if (params.departmentId) queryParams.append("department_id", params.departmentId);
  if (params.submitterId) queryParams.append("submitter_id", params.submitterId);
  if (params.statusFilter) queryParams.append("status_filter", params.statusFilter);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.pageSize) queryParams.append("page_size", params.pageSize.toString());

  const url = `/expenses/?${queryParams.toString()}`;
  const response = await apiClient.get<ExpenseListResponse>(url);
  return response;
}

/**
 * Get single expense by ID
 */
export async function getExpense(id: string): Promise<Expense> {
  const response = await apiClient.get<Expense>(`/expenses/${id}`);
  return response;
}

/**
 * Create new expense
 */
export async function createExpense(data: {
  entityId: string;
  departmentId: string;
  categoryId: string;
  expenseType: "expense" | "per_diem" | "advance";
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  description?: string;
}): Promise<Expense> {
  const response = await apiClient.post<Expense>("/expenses/", {
    entityId: data.entityId,
    departmentId: data.departmentId,
    categoryId: data.categoryId,
    expenseType: data.expenseType,
    title: data.title,
    amount: data.amount,
    currency: data.currency,
    expenseDate: data.expenseDate,
    description: data.description,
  });
  return response;
}

/**
 * Update expense (draft only)
 */
export async function updateExpense(
  id: string,
  data: Partial<{
    title: string;
    amount: number;
    currency: string;
    expenseDate: string;
    description: string;
  }>
): Promise<Expense> {
  const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
  return response;
}

/**
 * Delete expense (draft only)
 */
export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}

/**
 * Submit expense for approval
 */
export async function submitExpense(id: string): Promise<Expense> {
  const response = await apiClient.post<Expense>(`/expenses/${id}/submit`);
  return response;
}

/**
 * Calculate per diem amount
 */
export async function calculatePerDiem(data: {
  entityId: string;
  designation: string;
  days: number;
  calculationDate?: string;
}): Promise<PerDiemCalculation> {
  const response = await apiClient.post<PerDiemCalculation>("/expenses/calculate-per-diem", {
    entityId: data.entityId,
    designation: data.designation,
    days: data.days,
    calculationDate: data.calculationDate,
  });
  return response;
}

/**
 * Get departments for entity
 * Uses non-admin endpoint accessible to all authenticated users in the entity
 */
export async function getDepartments(entityId: string): Promise<{ departments: Department[] }> {
  const response = await apiClient.get<{ departments: Department[] }>(
    `/expenses/entity/${entityId}/departments`
  );
  return response;
}

/**
 * Get expense categories for entity
 * Uses non-admin endpoint accessible to all authenticated users in the entity
 */
export async function getExpenseCategories(
  entityId: string
): Promise<{ categories: ExpenseCategory[] }> {
  const response = await apiClient.get<{ categories: ExpenseCategory[] }>(
    `/expenses/entity/${entityId}/categories`
  );
  return response;
}

/**
 * Get budgets for entity
 */
export async function getBudgets(entityId: string): Promise<{ budgets: Budget[] }> {
  const response = await apiClient.get<{ budgets: Budget[] }>(
    `/admin/entities/${entityId}/budgets`
  );
  return response;
}

/**
 * Get per diem rates for entity
 */
export async function getPerDiemRates(entityId: string): Promise<{ rates: PerDiemRate[] }> {
  const response = await apiClient.get<{ rates: PerDiemRate[] }>(
    `/admin/entities/${entityId}/per-diem-rates`
  );
  return response;
}

/**
 * Create per diem rate
 */
export async function createPerDiemRate(
  entityId: string,
  data: {
    designation: string;
    ratePerDay: number;
    currency: string;
    effectiveFrom: string;
    effectiveTo?: string | null;
    isActive?: boolean;
  }
): Promise<PerDiemRate> {
  const response = await apiClient.post<PerDiemRate>(`/admin/entities/${entityId}/per-diem-rates`, {
    designation: data.designation,
    rate_per_day: data.ratePerDay,
    currency: data.currency,
    effective_from: data.effectiveFrom,
    effective_to: data.effectiveTo ?? null,
    is_active: data.isActive ?? true,
  });
  return response;
}

/**
 * Get all entities
 */
export async function getEntities(): Promise<{ entities: Entity[] }> {
  const response = await apiClient.get<{ entities: Entity[] }>("/admin/entities");
  return response;
}

/**
 * Create entity
 */
export async function createEntity(data: {
  name: string;
  code: string;
  countryCode: string;
  currency: string;
  isActive?: boolean;
  quickbooksCompanyId?: string;
  quickbooksRealmId?: string;
  quickbooksEnabled?: boolean;
}): Promise<Entity> {
  const response = await apiClient.post<Entity>("/admin/entities", {
    name: data.name,
    code: data.code,
    country_code: data.countryCode,
    currency: data.currency,
    is_active: data.isActive ?? true,
    quickbooks_company_id: data.quickbooksCompanyId,
    quickbooks_realm_id: data.quickbooksRealmId,
    quickbooks_enabled: data.quickbooksEnabled ?? false,
  });
  return response;
}

/**
 * Update entity
 */
export async function updateEntity(
  entityId: string,
  data: Partial<{
    name: string;
    code: string;
    countryCode: string;
    currency: string;
    isActive: boolean;
    quickbooksCompanyId: string;
    quickbooksRealmId: string;
    quickbooksEnabled: boolean;
  }>
): Promise<Entity> {
  const response = await apiClient.put<Entity>(`/admin/entities/${entityId}`, {
    name: data.name,
    code: data.code,
    country_code: data.countryCode,
    currency: data.currency,
    is_active: data.isActive,
    quickbooks_company_id: data.quickbooksCompanyId,
    quickbooks_realm_id: data.quickbooksRealmId,
    quickbooks_enabled: data.quickbooksEnabled,
  });
  return response;
}

/**
 * Create department
 */
export async function createDepartment(
  entityId: string,
  data: {
    name: string;
    code: string;
    budgetLimit?: number;
    isActive?: boolean;
    glCode?: string;
    glClassId?: string;
  }
): Promise<Department> {
  const response = await apiClient.post<Department>(`/admin/entities/${entityId}/departments`, {
    name: data.name,
    code: data.code,
    budget_limit: data.budgetLimit,
    is_active: data.isActive ?? true,
    gl_code: data.glCode,
    gl_class_id: data.glClassId,
  });
  return response;
}

/**
 * Get branches for entity
 */
export async function getBranches(entityId: string): Promise<{ branches: Branch[] }> {
  const response = await apiClient.get<{ branches: Branch[] }>(
    `/admin/entities/${entityId}/branches`
  );
  return response;
}

/**
 * Create branch
 */
export async function createBranch(
  entityId: string,
  data: {
    name: string;
    code: string;
    location?: string;
    isActive?: boolean;
    glCode?: string;
    glClassId?: string;
  }
): Promise<Branch> {
  const response = await apiClient.post<Branch>(`/admin/entities/${entityId}/branches`, {
    name: data.name,
    code: data.code,
    location: data.location,
    is_active: data.isActive ?? true,
    gl_code: data.glCode,
    gl_class_id: data.glClassId,
  });
  return response;
}

/**
 * Create expense category
 */
export async function createExpenseCategory(
  entityId: string,
  data: {
    name: string;
    code: string;
    description?: string;
    requiresReceipt?: boolean;
    isActive?: boolean;
    glCode?: string;
    glClassId?: string;
  }
): Promise<ExpenseCategory> {
  const response = await apiClient.post<ExpenseCategory>(
    `/admin/entities/${entityId}/expense-categories`,
    {
      name: data.name,
      code: data.code,
      description: data.description,
      requires_receipt: data.requiresReceipt ?? true,
      is_active: data.isActive ?? true,
      gl_code: data.glCode,
      gl_class_id: data.glClassId,
    }
  );
  return response;
}

/**
 * Get job roles for entity
 */
export async function getJobRoles(entityId: string): Promise<{ job_roles: JobRole[] }> {
  const response = await apiClient.get<{ job_roles: JobRole[] }>(
    `/admin/entities/${entityId}/job-roles`
  );
  return response;
}

/**
 * Create job role
 */
export async function createJobRole(
  entityId: string,
  data: {
    name: string;
    code: string;
    level: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<JobRole> {
  const response = await apiClient.post<JobRole>(`/admin/entities/${entityId}/job-roles`, {
    name: data.name,
    code: data.code,
    level: data.level,
    description: data.description,
    is_active: data.isActive ?? true,
  });
  return response;
}

// ==================== Approval Functions ====================

/**
 * Get expense with full approval chain details
 */
export async function getExpenseWithApprovals(expenseId: string): Promise<ExpenseWithApprovals> {
  const response = await apiClient.get<ExpenseWithApprovals>(
    `/expenses/${expenseId}/with-approvals`
  );
  return response;
}

/**
 * Get pending approvals for current user
 */
export async function getPendingApprovals(entityId?: string): Promise<PendingApprovalsResponse> {
  const params = new URLSearchParams();
  if (entityId) params.append("entityId", entityId);

  const url = `/expenses/pending-approvals${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiClient.get<PendingApprovalsResponse>(url);
  return response;
}

/**
 * Approve an expense at the current step
 */
export async function approveExpense(
  expenseId: string,
  comments?: string
): Promise<ApprovalActionResponse> {
  const response = await apiClient.post<ApprovalActionResponse>(`/expenses/${expenseId}/approve`, {
    comments,
  });
  return response;
}

/**
 * Reject an expense at the current step
 */
export async function rejectExpense(
  expenseId: string,
  reason: string
): Promise<ApprovalActionResponse> {
  const response = await apiClient.post<ApprovalActionResponse>(`/expenses/${expenseId}/reject`, {
    reason,
  });
  return response;
}
