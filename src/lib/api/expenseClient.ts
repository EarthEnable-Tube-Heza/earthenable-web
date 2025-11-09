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
  expense_type: "expense" | "per_diem" | "advance";
  title: string;
  amount: number;
  currency: string;
  expense_date: string;
  description?: string;
  status: "draft" | "submitted" | "approved" | "rejected" | "paid";
  created_at: string;
  updated_at: string;
  // Joined fields
  submitter_name?: string;
  department_name?: string;
  category_name?: string;
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
  name: string;
  code: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code?: string;
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
  effective_date: string;
  is_active: boolean;
  created_at: string;
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
 */
export async function getDepartments(entityId: string): Promise<{ departments: Department[] }> {
  const response = await apiClient.get<{ departments: Department[] }>(
    `/admin/entities/${entityId}/departments`
  );
  return response;
}

/**
 * Get expense categories for entity
 */
export async function getExpenseCategories(
  entityId: string
): Promise<{ categories: ExpenseCategory[] }> {
  const response = await apiClient.get<{ categories: ExpenseCategory[] }>(
    `/admin/entities/${entityId}/expense-categories`
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
