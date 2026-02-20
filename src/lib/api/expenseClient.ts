/**
 * Expense API Client
 *
 * Methods for interacting with expense management endpoints
 */

import { apiClient } from "./apiClient";

export interface ExpenseTypeConfig {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  entity_id: string;
  department_id: string;
  submitter_id: string;
  category_id: string;
  // Expense type (DB-driven)
  expense_type_id?: string;
  expenseTypeId?: string;
  expense_type_name?: string;
  expenseTypeName?: string;
  expense_type_code?: string;
  expenseTypeCode?: string;
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
  // Approval phase tracking
  current_approval_phase?: "request" | "finance" | "complete";
  currentApprovalPhase?: "request" | "finance" | "complete";
  // QuickBooks integration
  quickbooks_journal_id?: string;
  quickbooksJournalId?: string;
  quickbooks_posted_at?: string;
  quickbooksPostedAt?: string;
  quickbooks_error?: string;
  quickbooksError?: string;
  // Joined fields (may come as snake_case or camelCase due to backend aliases)
  submitter_name?: string;
  submitterName?: string;
  department_name?: string;
  departmentName?: string;
  category_name?: string;
  categoryName?: string;
  // Attachment metadata
  attachment_count?: number;
  attachmentCount?: number;
  requires_receipt?: boolean;
  requiresReceipt?: boolean;
  // Payment / banking details (recipient)
  account_name?: string;
  accountName?: string;
  account_number?: string;
  accountNumber?: string;
  bank_name?: string;
  bankName?: string;
  // Approval step progress
  current_step?: number;
  currentStep?: number;
  total_steps?: number;
  totalSteps?: number;
  approved_steps?: number;
  approvedSteps?: number;
  // Finance processing fields
  batch_number?: string;
  batchNumber?: string;
  payment_account_id?: string;
  paymentAccountId?: string;
  payment_account_name?: string;
  paymentAccountName?: string;
  quickbooks_expense_account_id?: string;
  quickbooksExpenseAccountId?: string;
  quickbooks_expense_account_name?: string;
  quickbooksExpenseAccountName?: string;
  payment_date?: string;
  paymentDate?: string;
  // Reference / submission tracking
  reference_number?: string;
  referenceNumber?: string;
  submitted_at?: string;
  submittedAt?: string;
  paid_at?: string;
  paidAt?: string;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExpenseSummary {
  // Support both snake_case and camelCase from backend
  total_count?: number;
  totalCount?: number;
  total_amount?: number;
  totalAmount?: number;
  draft_count?: number;
  draftCount?: number;
  submitted_count?: number;
  submittedCount?: number;
  approved_count?: number;
  approvedCount?: number;
  rejected_count?: number;
  rejectedCount?: number;
  paid_count?: number;
  paidCount?: number;
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
  entityId: string;
  departmentId: string;
  categoryId: string | null;
  name: string;
  description?: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  currency: string;
  period: string;
  startDate: string;
  endDate: string;
  departmentName: string | null;
  categoryName: string | null;
  status: "on_track" | "at_risk" | "over_budget";
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  overallUtilization: number;
  departmentCount: number;
  onTrackCount: number;
  atRiskCount: number;
  overBudgetCount: number;
  departments: DepartmentBudgetSummary[];
}

export interface DepartmentBudgetSummary {
  departmentId: string;
  departmentName: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: "on_track" | "at_risk" | "over_budget";
}

export interface DepartmentBudgetBreakdown {
  departmentId: string;
  departmentName: string;
  overallBudget: CategoryBudget | null;
  categoryBreakdown: CategoryBudget[];
}

export interface CategoryBudget {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilizationPercentage: number;
  status: "on_track" | "at_risk" | "over_budget";
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

export interface EntityCurrency {
  id: string;
  entity_id: string;
  currency_code: string;
  currency_name: string;
  is_default: boolean;
  exchange_rate: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobRole {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  seniority_level_id?: string;
  seniority_level_name?: string;
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
  chain?: "request" | "finance";
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
  expenseTypeId: string;
  expenseTypeName?: string;
  expenseTypeCode?: string;
  submitterId: string;
  submitterName?: string;
  departmentId?: string;
  departmentName?: string;
  stepOrder: number;
  totalSteps: number;
  chain?: string;
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

export interface ApprovalHistoryItem {
  approvalId: string;
  expenseId: string;
  expenseTitle: string;
  expenseAmount: number;
  expenseCurrency: string;
  expenseDate: string;
  expenseStatus: "draft" | "submitted" | "approved" | "rejected" | "paid";
  expenseTypeId?: string;
  expenseTypeName?: string;
  expenseTypeCode?: string;
  submitterId: string;
  submitterName?: string;
  departmentId?: string;
  departmentName?: string;
  stepOrder: number;
  totalSteps: number;
  chain: "request" | "finance";
  approvalStatus: "pending" | "approved" | "rejected";
  approvalComments?: string;
  approvedAt?: string;
  submittedAt?: string;
  paidAt?: string;
  paymentDate?: string;
}

export interface ApprovalHistoryResponse {
  success: boolean;
  approvals: ApprovalHistoryItem[];
  totalCount: number;
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

  if (departmentId) params.append("departmentId", departmentId);

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

  if (params.entityId) queryParams.append("entityId", params.entityId);
  if (params.departmentId) queryParams.append("departmentId", params.departmentId);
  if (params.submitterId) queryParams.append("submitterId", params.submitterId);
  if (params.statusFilter) queryParams.append("status", params.statusFilter);
  if (params.page)
    queryParams.append("skip", ((params.page - 1) * (params.pageSize || 100)).toString());
  if (params.pageSize) queryParams.append("limit", params.pageSize.toString());

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
  expenseTypeId: string;
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  description?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
}): Promise<Expense> {
  const response = await apiClient.post<Expense>("/expenses/", {
    entityId: data.entityId,
    departmentId: data.departmentId,
    categoryId: data.categoryId,
    expenseTypeId: data.expenseTypeId,
    title: data.title,
    amount: data.amount,
    currency: data.currency,
    expenseDate: data.expenseDate,
    description: data.description,
    accountName: data.accountName,
    accountNumber: data.accountNumber,
    bankName: data.bankName,
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
    accountName: string;
    accountNumber: string;
    bankName: string;
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
export async function getBudgets(
  entityId: string,
  departmentId?: string
): Promise<{ budgets: Budget[] }> {
  const params = new URLSearchParams();
  if (departmentId) params.append("departmentId", departmentId);

  const url = `/expenses/entity/${entityId}/budgets${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiClient.get<{ budgets: Budget[] }>(url);
  return response;
}

/**
 * Get budget summary for entity
 */
export async function getBudgetSummary(entityId: string): Promise<BudgetSummary> {
  const response = await apiClient.get<BudgetSummary>(`/admin/entities/${entityId}/budget-summary`);
  return response;
}

/**
 * Get budget breakdown for a department
 */
export async function getDepartmentBudgetBreakdown(
  entityId: string,
  departmentId: string
): Promise<DepartmentBudgetBreakdown> {
  const response = await apiClient.get<DepartmentBudgetBreakdown>(
    `/admin/entities/${entityId}/budgets/${departmentId}/breakdown`
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
 * Get expense types for entity (user-facing, active only)
 */
export async function getExpenseTypes(
  entityId: string
): Promise<{ expense_types: ExpenseTypeConfig[] }> {
  const response = await apiClient.get<{ expense_types: ExpenseTypeConfig[] }>(
    `/expenses/entity/${entityId}/types`
  );
  return response;
}

/**
 * Get expense types for entity (admin, includes inactive)
 */
export async function getExpenseTypesAdmin(
  entityId: string,
  includeInactive = true
): Promise<{ expense_types: ExpenseTypeConfig[] }> {
  const params = includeInactive ? "?include_inactive=true" : "";
  const response = await apiClient.get<{ expense_types: ExpenseTypeConfig[] }>(
    `/admin/entities/${entityId}/expense-types${params}`
  );
  return response;
}

/**
 * Create expense type
 */
export async function createExpenseType(
  entityId: string,
  data: {
    name: string;
    code: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }
): Promise<ExpenseTypeConfig> {
  const response = await apiClient.post<ExpenseTypeConfig>(
    `/admin/entities/${entityId}/expense-types`,
    {
      name: data.name,
      code: data.code,
      description: data.description,
      is_active: data.isActive ?? true,
      display_order: data.displayOrder ?? 0,
    }
  );
  return response;
}

/**
 * Update expense type
 */
export async function updateExpenseType(
  entityId: string,
  typeId: string,
  data: {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }
): Promise<ExpenseTypeConfig> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.code !== undefined) payload.code = data.code;
  if (data.description !== undefined) payload.description = data.description;
  if (data.isActive !== undefined) payload.is_active = data.isActive;
  if (data.displayOrder !== undefined) payload.display_order = data.displayOrder;

  const response = await apiClient.patch<ExpenseTypeConfig>(
    `/admin/entities/${entityId}/expense-types/${typeId}`,
    payload
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
    seniority_level_id?: string;
    description?: string;
    isActive?: boolean;
  }
): Promise<JobRole> {
  const response = await apiClient.post<JobRole>(`/admin/entities/${entityId}/job-roles`, {
    name: data.name,
    code: data.code,
    seniority_level_id: data.seniority_level_id,
    description: data.description,
    is_active: data.isActive ?? true,
  });
  return response;
}

/**
 * Get seniority levels (global + entity-scoped)
 */
export interface SeniorityLevel {
  id: string;
  entity_id?: string;
  name: string;
  code: string;
  rank: number;
  description?: string;
  is_active: boolean;
}

export async function getSeniorityLevels(entityId?: string): Promise<SeniorityLevel[]> {
  const params = entityId ? `?entity_id=${entityId}` : "";
  const response = await apiClient.get<SeniorityLevel[]>(`/admin/seniority-levels${params}`);
  return response;
}

// ==================== Attachment Types & Functions ====================

export interface ExpenseAttachment {
  id: string;
  expenseId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ExpenseAttachmentListResponse {
  success: boolean;
  attachments: ExpenseAttachment[];
}

export interface PresignedDownloadResponse {
  success: boolean;
  url: string;
  expiresIn: number;
}

/**
 * Upload a file attachment to an expense
 */
export async function uploadExpenseAttachment(
  expenseId: string,
  file: File
): Promise<ExpenseAttachment> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<ExpenseAttachment>(
    `/expenses/${expenseId}/attachments`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
}

/**
 * List all attachments for an expense
 */
export async function getExpenseAttachments(
  expenseId: string
): Promise<ExpenseAttachmentListResponse> {
  const response = await apiClient.get<ExpenseAttachmentListResponse>(
    `/expenses/${expenseId}/attachments`
  );
  return response;
}

/**
 * Get presigned download URL for an attachment
 *
 * @param attachmentId - Attachment ID
 * @param inline - If true, URL uses Content-Disposition: inline for browser preview
 */
export async function getAttachmentDownloadUrl(
  attachmentId: string,
  inline: boolean = false
): Promise<PresignedDownloadResponse> {
  const params = inline ? { inline: "true" } : {};
  const response = await apiClient.get<PresignedDownloadResponse>(
    `/expenses/attachments/${attachmentId}/download-url`,
    { params }
  );
  return response;
}

/**
 * Delete an attachment
 */
export async function deleteExpenseAttachment(attachmentId: string): Promise<void> {
  await apiClient.delete(`/expenses/attachments/${attachmentId}`);
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
 * Get approval history for current user (all expenses they've acted on or are assigned to)
 */
export async function getApprovalHistory(entityId?: string): Promise<ApprovalHistoryResponse> {
  const params = new URLSearchParams();
  if (entityId) params.append("entityId", entityId);

  const url = `/expenses/approval-history${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await apiClient.get<ApprovalHistoryResponse>(url);
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

// ==================== Mark as Paid Functions ====================

export interface MarkPaidResponse {
  success: boolean;
  message: string;
  expense: Expense;
}

export interface MarkPaidData {
  referenceNumber?: string;
  batchNumber?: string;
  paymentAccountId?: string;
  quickbooksExpenseAccountId?: string;
  quickbooksExpenseAccountName?: string;
  paymentDate?: string;
}

/**
 * Mark an approved expense as paid
 */
export async function markExpenseAsPaid(
  expenseId: string,
  data?: MarkPaidData | string
): Promise<MarkPaidResponse> {
  // Support both legacy (string referenceNumber) and new (object) signatures
  const body: MarkPaidData = typeof data === "string" ? { referenceNumber: data } : data || {};
  const response = await apiClient.post<MarkPaidResponse>(`/expenses/${expenseId}/mark-paid`, body);
  return response;
}

// ==================== Payment Account Functions ====================

export interface PaymentAccount {
  id: string;
  entity_id: string;
  name: string;
  account_number?: string;
  bank_name?: string;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentAccountData {
  name: string;
  account_number?: string;
  bank_name?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface UpdatePaymentAccountData {
  name?: string;
  account_number?: string;
  bank_name?: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Get active payment accounts for an entity (finance users)
 */
export async function getPaymentAccounts(entityId: string): Promise<PaymentAccount[]> {
  const response = await apiClient.get<{ payment_accounts: PaymentAccount[] }>(
    `/expenses/entity/${entityId}/payment-accounts`
  );
  return response.payment_accounts;
}

/**
 * Get payment accounts for admin management
 */
export async function getPaymentAccountsAdmin(
  entityId: string,
  includeInactive = true
): Promise<PaymentAccount[]> {
  const response = await apiClient.get<{ payment_accounts: PaymentAccount[] }>(
    `/admin/entities/${entityId}/payment-accounts?include_inactive=${includeInactive}`
  );
  return response.payment_accounts;
}

/**
 * Create a payment account (admin)
 */
export async function createPaymentAccount(
  entityId: string,
  data: CreatePaymentAccountData
): Promise<PaymentAccount> {
  const response = await apiClient.post<PaymentAccount>(
    `/admin/entities/${entityId}/payment-accounts`,
    data
  );
  return response;
}

/**
 * Update a payment account (admin)
 */
export async function updatePaymentAccount(
  entityId: string,
  accountId: string,
  data: UpdatePaymentAccountData
): Promise<PaymentAccount> {
  const response = await apiClient.patch<PaymentAccount>(
    `/admin/entities/${entityId}/payment-accounts/${accountId}`,
    data
  );
  return response;
}

/**
 * Get QuickBooks chart of accounts for finance users (non-admin endpoint)
 */
export async function getQuickBooksChartOfAccountsForFinance(
  entityId: string
): Promise<QuickBooksAccount[]> {
  const response = await apiClient.get<{ accounts: QuickBooksAccount[] }>(
    `/expenses/entity/${entityId}/quickbooks/chart-of-accounts`
  );
  return response.accounts;
}

// ==================== QuickBooks Functions ====================

export interface QuickBooksConnectionStatus {
  entityId: string;
  connected: boolean;
  realmId?: string;
  companyId?: string;
  connectedAt?: string;
  tokenExpiresAt?: string;
  environment: string;
}

export interface QuickBooksAuthUrlResponse {
  auth_url: string;
  entity_id: string;
}

export interface QuickBooksTestResponse {
  entity_id: string;
  success: boolean;
  message: string;
}

export interface QuickBooksAccount {
  id: string;
  name: string;
  fully_qualified_name?: string;
  account_type?: string;
  account_sub_type?: string;
  account_number?: string;
  classification?: string;
  active: boolean;
}

export interface PostToQuickBooksResponse {
  success: boolean;
  message: string;
  expenseId: string;
  journalId?: string;
  postedAt?: string;
}

export interface QuickBooksExpenseStatus {
  expenseId: string;
  posted: boolean;
  journalId?: string;
  postedAt?: string;
  postedById?: string;
  error?: string;
}

export interface QuickBooksBudgetSyncResponse {
  entityId: string;
  fiscalYear?: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  syncedAt?: string;
}

export interface QuickBooksBudgetSyncStatus {
  entityId: string;
  syncedBudgetCount: number;
  lastSyncedAt?: string;
}

/**
 * Get QuickBooks authorization URL for entity
 */
export async function getQuickBooksAuthUrl(entityId: string): Promise<QuickBooksAuthUrlResponse> {
  const response = await apiClient.get<QuickBooksAuthUrlResponse>(
    `/admin/entities/${entityId}/quickbooks/auth-url`
  );
  return response;
}

/**
 * Get QuickBooks connection status for entity
 */
export async function getQuickBooksStatus(entityId: string): Promise<QuickBooksConnectionStatus> {
  const response = await apiClient.get<QuickBooksConnectionStatus>(
    `/admin/entities/${entityId}/quickbooks/status`
  );
  return response;
}

/**
 * Disconnect QuickBooks for entity
 */
export async function disconnectQuickBooks(entityId: string): Promise<QuickBooksConnectionStatus> {
  const response = await apiClient.post<QuickBooksConnectionStatus>(
    `/admin/entities/${entityId}/quickbooks/disconnect`
  );
  return response;
}

/**
 * Test QuickBooks connection for entity
 */
export async function testQuickBooksConnection(entityId: string): Promise<QuickBooksTestResponse> {
  const response = await apiClient.post<QuickBooksTestResponse>(
    `/admin/entities/${entityId}/quickbooks/test`
  );
  return response;
}

/**
 * Get chart of accounts from QuickBooks
 */
export async function getQuickBooksChartOfAccounts(entityId: string): Promise<QuickBooksAccount[]> {
  const response = await apiClient.get<QuickBooksAccount[]>(
    `/admin/entities/${entityId}/quickbooks/chart-of-accounts`
  );
  return response;
}

/**
 * Post a paid expense to QuickBooks as a journal entry
 */
export async function postExpenseToQuickBooks(
  expenseId: string,
  creditAccountName?: string
): Promise<PostToQuickBooksResponse> {
  const response = await apiClient.post<PostToQuickBooksResponse>(
    `/expenses/${expenseId}/post-to-quickbooks`,
    creditAccountName ? { creditAccountName } : {}
  );
  return response;
}

/**
 * Get QuickBooks posting status for an expense
 */
export async function getExpenseQuickBooksStatus(
  expenseId: string
): Promise<QuickBooksExpenseStatus> {
  const response = await apiClient.get<QuickBooksExpenseStatus>(
    `/expenses/${expenseId}/quickbooks-status`
  );
  return response;
}

/**
 * Manually trigger QuickBooks budget sync for an entity
 */
export async function syncQuickBooksBudgets(
  entityId: string,
  fiscalYear?: number
): Promise<QuickBooksBudgetSyncResponse> {
  const params = new URLSearchParams();
  if (fiscalYear) params.append("fiscal_year", fiscalYear.toString());

  const url = `/expenses/entity/${entityId}/quickbooks/sync-budgets${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  const response = await apiClient.post<QuickBooksBudgetSyncResponse>(url);
  return response;
}

/**
 * Get QuickBooks budget sync status for an entity
 */
export async function getQuickBooksSyncStatus(
  entityId: string
): Promise<QuickBooksBudgetSyncStatus> {
  const response = await apiClient.get<QuickBooksBudgetSyncStatus>(
    `/expenses/entity/${entityId}/quickbooks/sync-status`
  );
  return response;
}

// ==================== Approval Workflow Admin Functions ====================

export interface ApprovalWorkflow {
  id: string;
  entity_id: string;
  name: string;
  description?: string;
  expense_type?: string;
  department_id?: string;
  department_name?: string;
  min_amount?: number;
  max_amount?: number;
  priority: number;
  is_active: boolean;
  steps: ApprovalWorkflowStep[];
  created_at: string;
  updated_at: string;
}

export interface ApprovalWorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  approver_role: string;
  chain: "request" | "finance";
  is_required: boolean;
  fallback_to_hierarchy: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * List approval workflows for an entity
 */
export async function getApprovalWorkflows(entityId: string): Promise<ApprovalWorkflow[]> {
  const response = await apiClient.get<{ workflows: ApprovalWorkflow[] }>(
    `/admin/entities/${entityId}/approval-workflows`
  );
  return response.workflows;
}

/**
 * Create an approval workflow
 */
export async function createApprovalWorkflow(
  entityId: string,
  data: {
    name: string;
    description?: string;
    expense_type?: string;
    department_id?: string;
    min_amount?: number;
    max_amount?: number;
    priority?: number;
    is_active?: boolean;
    steps?: Array<{
      step_order: number;
      approver_role: string;
      chain?: string;
      is_required?: boolean;
      fallback_to_hierarchy?: boolean;
    }>;
  }
): Promise<ApprovalWorkflow> {
  const response = await apiClient.post<ApprovalWorkflow>(
    `/admin/entities/${entityId}/approval-workflows`,
    data
  );
  return response;
}

/**
 * Update an approval workflow
 */
export async function updateApprovalWorkflow(
  workflowId: string,
  data: {
    name?: string;
    description?: string;
    expense_type?: string;
    department_id?: string;
    min_amount?: number;
    max_amount?: number;
    priority?: number;
    is_active?: boolean;
  }
): Promise<ApprovalWorkflow> {
  const response = await apiClient.put<ApprovalWorkflow>(
    `/admin/approval-workflows/${workflowId}`,
    data
  );
  return response;
}

/**
 * Delete (deactivate) an approval workflow
 */
export async function deleteApprovalWorkflow(workflowId: string): Promise<void> {
  await apiClient.delete(`/admin/approval-workflows/${workflowId}`);
}

/**
 * Add a step to a workflow
 */
export async function addApprovalWorkflowStep(
  workflowId: string,
  data: {
    step_order: number;
    approver_role: string;
    chain?: string;
    is_required?: boolean;
    fallback_to_hierarchy?: boolean;
  }
): Promise<ApprovalWorkflowStep> {
  const response = await apiClient.post<ApprovalWorkflowStep>(
    `/admin/approval-workflows/${workflowId}/steps`,
    data
  );
  return response;
}

/**
 * Update an approval step
 */
export async function updateApprovalStep(
  stepId: string,
  data: {
    step_order?: number;
    approver_role?: string;
    chain?: string;
    is_required?: boolean;
    fallback_to_hierarchy?: boolean;
  }
): Promise<ApprovalWorkflowStep> {
  const response = await apiClient.put<ApprovalWorkflowStep>(
    `/admin/approval-steps/${stepId}`,
    data
  );
  return response;
}

/**
 * Delete an approval step
 */
export async function deleteApprovalStep(stepId: string): Promise<void> {
  await apiClient.delete(`/admin/approval-steps/${stepId}`);
}

// ==================== Entity Currency API ====================

/**
 * Get all currencies for an entity
 */
export async function getEntityCurrencies(
  entityId: string
): Promise<{ currencies: EntityCurrency[] }> {
  const response = await apiClient.get<{ currencies: EntityCurrency[] }>(
    `/admin/entities/${entityId}/currencies`
  );
  return response;
}

/**
 * Create a currency for an entity
 */
export async function createEntityCurrency(
  entityId: string,
  data: {
    currency_code: string;
    currency_name: string;
    is_default?: boolean;
    exchange_rate?: number | null;
    is_active?: boolean;
  }
): Promise<EntityCurrency> {
  const response = await apiClient.post<EntityCurrency>(
    `/admin/entities/${entityId}/currencies`,
    data
  );
  return response;
}

/**
 * Update a currency for an entity
 */
export async function updateEntityCurrency(
  entityId: string,
  currencyId: string,
  data: {
    currency_code?: string;
    currency_name?: string;
    is_default?: boolean;
    exchange_rate?: number | null;
    is_active?: boolean;
  }
): Promise<EntityCurrency> {
  const response = await apiClient.patch<EntityCurrency>(
    `/admin/entities/${entityId}/currencies/${currencyId}`,
    data
  );
  return response;
}

/**
 * Delete a currency from an entity
 */
export async function deleteEntityCurrency(entityId: string, currencyId: string): Promise<void> {
  await apiClient.delete(`/admin/entities/${entityId}/currencies/${currencyId}`);
}

/**
 * Set a currency as the default for an entity
 */
export async function setDefaultEntityCurrency(
  entityId: string,
  currencyId: string
): Promise<EntityCurrency> {
  const response = await apiClient.post<EntityCurrency>(
    `/admin/entities/${entityId}/currencies/${currencyId}/set-default`
  );
  return response;
}
