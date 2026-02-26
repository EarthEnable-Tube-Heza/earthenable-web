/**
 * React Query hooks for expense management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseAPI from "@/src/lib/api/expenseClient";
import { apiClient } from "@/src/lib/api";
import { useAuth } from "@/src/lib/auth";

/**
 * Response shape from /auth/me (includes employee details)
 */
interface EntityCurrencyBrief {
  id: string;
  currency_code: string;
  currency_name: string;
  is_default: boolean;
  exchange_rate: number | null;
}

interface UserWithEmployee {
  id: string;
  email: string;
  name?: string;
  role: string;
  employee?: {
    entity?: {
      id: string;
      name: string;
      code: string;
      currency: string;
      currencies: EntityCurrencyBrief[];
    };
    department?: { id: string; name: string };
    role: string;
    level?: string;
  };
}

/**
 * Hook to fetch the current user's employee info (including department).
 * Uses the /auth/me endpoint which returns UserWithEmployeeResponse.
 */
export function useCurrentUserEmployee() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current-user-employee", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<UserWithEmployee>("auth/me");
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook to fetch expense summary statistics
 */
export function useExpenseSummary() {
  const { selectedEntityId } = useAuth();

  return useQuery({
    queryKey: ["expense-summary", selectedEntityId],
    queryFn: () => expenseAPI.getExpenseSummary(selectedEntityId || ""),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to list expenses with optional filtering
 */
export function useExpenses(params: {
  statusFilter?: string;
  departmentId?: string;
  submitterId?: string;
  allSubmitters?: boolean;
}) {
  const { user, selectedEntityId } = useAuth();

  return useQuery({
    queryKey: ["expenses", selectedEntityId, params],
    queryFn: () =>
      expenseAPI.listExpenses({
        entityId: selectedEntityId || "",
        submitterId: params.allSubmitters ? undefined : params.submitterId || user?.id,
        statusFilter: params.statusFilter === "all" ? undefined : params.statusFilter,
        departmentId: params.departmentId,
      }),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to get single expense
 */
export function useExpense(id: string) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => expenseAPI.getExpense(id),
    enabled: !!id,
  });
}

/**
 * Hook to create expense
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseAPI.createExpense,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });
}

/**
 * Hook to update expense (draft only)
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof expenseAPI.updateExpense>[1];
    }) => expenseAPI.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });
}

/**
 * Hook to delete expense (draft only)
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseAPI.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });
}

/**
 * Hook to submit expense for approval
 */
export function useSubmitExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseAPI.submitExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
    },
  });
}

/**
 * Hook to calculate per diem
 */
export function useCalculatePerDiem() {
  const { selectedEntityId } = useAuth();

  return useMutation({
    mutationFn: (data: { designation: string; days: number; calculationDate?: string }) =>
      expenseAPI.calculatePerDiem({
        entityId: selectedEntityId || "",
        ...data,
      }),
  });
}

/**
 * Hook to get departments
 */
export function useDepartments(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["departments", finalEntityId],
    queryFn: () => expenseAPI.getDepartments(finalEntityId),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to get expense categories
 */
export function useExpenseCategories(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["expense-categories", finalEntityId],
    queryFn: () => expenseAPI.getExpenseCategories(finalEntityId),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to get budgets
 */
export function useBudgets(departmentId?: string) {
  const { selectedEntityId } = useAuth();

  return useQuery({
    queryKey: ["budgets", selectedEntityId, departmentId],
    queryFn: () => expenseAPI.getBudgets(selectedEntityId || "", departmentId),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to get budget summary for entity
 */
export function useBudgetSummary() {
  const { selectedEntityId } = useAuth();

  return useQuery({
    queryKey: ["budget-summary", selectedEntityId],
    queryFn: () => expenseAPI.getBudgetSummary(selectedEntityId || ""),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to get department budget breakdown
 */
export function useDepartmentBudgetBreakdown(departmentId: string) {
  const { selectedEntityId } = useAuth();

  return useQuery({
    queryKey: ["department-budget-breakdown", selectedEntityId, departmentId],
    queryFn: () => expenseAPI.getDepartmentBudgetBreakdown(selectedEntityId || "", departmentId),
    enabled: !!selectedEntityId && !!departmentId,
  });
}

/**
 * Hook to get per diem rates
 */
export function usePerDiemRates(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["per-diem-rates", finalEntityId],
    queryFn: () => expenseAPI.getPerDiemRates(finalEntityId),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to create per diem rate
 */
export function useCreatePerDiemRate(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createPerDiemRate>[1]) =>
      expenseAPI.createPerDiemRate(finalEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["per-diem-rates"] });
    },
  });
}

/**
 * Hook to get job roles
 */
export function useJobRoles(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["job-roles", finalEntityId],
    queryFn: () => expenseAPI.getJobRoles(finalEntityId),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to get seniority levels (global + entity-scoped)
 */
export function useSeniorityLevels(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || undefined;

  return useQuery({
    queryKey: ["seniority-levels", finalEntityId],
    queryFn: () => expenseAPI.getSeniorityLevels(finalEntityId),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

/**
 * Hook to create job role
 */
export function useCreateJobRole(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createJobRole>[1]) =>
      expenseAPI.createJobRole(finalEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-roles"] });
    },
  });
}

/**
 * Hook to update job role
 */
export function useUpdateJobRole(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: string;
      data: Parameters<typeof expenseAPI.updateJobRole>[2];
    }) => expenseAPI.updateJobRole(finalEntityId, roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-roles"] });
    },
  });
}

/**
 * Hook to delete (deactivate) job role
 */
export function useDeleteJobRole(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (roleId: string) => expenseAPI.deleteJobRole(finalEntityId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-roles"] });
    },
  });
}

/**
 * Hook to create seniority level
 */
export function useCreateSeniorityLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createSeniorityLevel>[0]) =>
      expenseAPI.createSeniorityLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seniority-levels"] });
    },
  });
}

/**
 * Hook to update seniority level
 */
export function useUpdateSeniorityLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      levelId,
      data,
    }: {
      levelId: string;
      data: Parameters<typeof expenseAPI.updateSeniorityLevel>[1];
    }) => expenseAPI.updateSeniorityLevel(levelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seniority-levels"] });
    },
  });
}

/**
 * Hook to delete (deactivate) seniority level
 */
export function useDeleteSeniorityLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (levelId: string) => expenseAPI.deleteSeniorityLevel(levelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seniority-levels"] });
    },
  });
}

/**
 * Hook to get all entities
 */
export function useEntities() {
  return useQuery({
    queryKey: ["entities"],
    queryFn: () => expenseAPI.getEntities(),
  });
}

/**
 * Hook to create entity
 */
export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: expenseAPI.createEntity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

/**
 * Hook to update entity
 */
export function useUpdateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof expenseAPI.updateEntity>[1];
    }) => expenseAPI.updateEntity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

// ==================== Entity Currency Hooks ====================

/**
 * Hook to get currencies for an entity
 */
export function useEntityCurrencies(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["entity-currencies", finalEntityId],
    queryFn: () => expenseAPI.getEntityCurrencies(finalEntityId),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to create a currency for an entity
 */
export function useCreateEntityCurrency(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createEntityCurrency>[1]) =>
      expenseAPI.createEntityCurrency(finalEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

/**
 * Hook to update a currency for an entity
 */
export function useUpdateEntityCurrency(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: ({
      currencyId,
      data,
    }: {
      currencyId: string;
      data: Parameters<typeof expenseAPI.updateEntityCurrency>[2];
    }) => expenseAPI.updateEntityCurrency(finalEntityId, currencyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

/**
 * Hook to delete a currency from an entity
 */
export function useDeleteEntityCurrency(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (currencyId: string) => expenseAPI.deleteEntityCurrency(finalEntityId, currencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

/**
 * Hook to set default currency for an entity
 */
export function useSetDefaultEntityCurrency(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (currencyId: string) =>
      expenseAPI.setDefaultEntityCurrency(finalEntityId, currencyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-currencies"] });
      queryClient.invalidateQueries({ queryKey: ["entities"] });
    },
  });
}

/**
 * Hook to create department
 */
export function useCreateDepartment(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createDepartment>[1]) =>
      expenseAPI.createDepartment(finalEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

/**
 * Hook to get branches
 */
export function useBranches(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["branches", finalEntityId],
    queryFn: () => expenseAPI.getBranches(finalEntityId),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to create branch
 */
export function useCreateBranch(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createBranch>[1]) =>
      expenseAPI.createBranch(finalEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

/**
 * Hook to create expense category
 */
export function useCreateExpenseCategory(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createExpenseCategory>[1]) =>
      expenseAPI.createExpenseCategory(finalEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
}

// ==================== Expense Type Hooks ====================

/**
 * Hook to get expense types for the selected entity (user-facing, active only)
 */
export function useExpenseTypes(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["expense-types", finalEntityId],
    queryFn: () => expenseAPI.getExpenseTypes(finalEntityId),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to get expense types for admin (includes inactive)
 */
export function useExpenseTypesAdmin(entityId?: string) {
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useQuery({
    queryKey: ["expense-types-admin", finalEntityId],
    queryFn: () => expenseAPI.getExpenseTypesAdmin(finalEntityId, true),
    enabled: !!finalEntityId,
  });
}

/**
 * Hook to create an expense type
 */
export function useCreateExpenseType(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createExpenseType>[1]) =>
      expenseAPI.createExpenseType(finalEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] });
      queryClient.invalidateQueries({ queryKey: ["expense-types-admin"] });
    },
  });
}

/**
 * Hook to update an expense type
 */
export function useUpdateExpenseType(entityId?: string) {
  const queryClient = useQueryClient();
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || "";

  return useMutation({
    mutationFn: ({
      typeId,
      data,
    }: {
      typeId: string;
      data: Parameters<typeof expenseAPI.updateExpenseType>[2];
    }) => expenseAPI.updateExpenseType(finalEntityId, typeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] });
      queryClient.invalidateQueries({ queryKey: ["expense-types-admin"] });
    },
  });
}

// ==================== Attachment Hooks ====================

/**
 * Hook to list attachments for an expense
 */
export function useExpenseAttachments(expenseId: string) {
  return useQuery({
    queryKey: ["expense-attachments", expenseId],
    queryFn: () => expenseAPI.getExpenseAttachments(expenseId),
    enabled: !!expenseId,
  });
}

/**
 * Hook to upload an attachment to an expense
 */
export function useUploadExpenseAttachment(expenseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => expenseAPI.uploadExpenseAttachment(expenseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-attachments", expenseId] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", expenseId] });
    },
  });
}

/**
 * Hook to delete an attachment from an expense
 */
export function useDeleteExpenseAttachment(expenseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) => expenseAPI.deleteExpenseAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-attachments", expenseId] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", expenseId] });
    },
  });
}

// ==================== Approval Hooks ====================

/**
 * Hook to get expense with full approval chain
 */
export function useExpenseWithApprovals(expenseId: string) {
  return useQuery({
    queryKey: ["expense-with-approvals", expenseId],
    queryFn: () => expenseAPI.getExpenseWithApprovals(expenseId),
    enabled: !!expenseId,
  });
}

/**
 * Hook to get pending approvals for current user
 */
export function usePendingApprovals(entityId?: string) {
  return useQuery({
    queryKey: ["pending-approvals", entityId],
    queryFn: () => expenseAPI.getPendingApprovals(entityId),
  });
}

/**
 * Hook to get approval history for the current user
 */
export function useApprovalHistory(entityId?: string) {
  return useQuery({
    queryKey: ["approval-history", entityId],
    queryFn: () => expenseAPI.getApprovalHistory(entityId),
  });
}

/**
 * Hook to approve an expense
 */
export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, comments }: { expenseId: string; comments?: string }) =>
      expenseAPI.approveExpense(expenseId, comments),
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["approval-history"] });
      queryClient.invalidateQueries({ queryKey: ["expense-with-approvals", variables.expenseId] });
    },
  });
}

/**
 * Hook to reject an expense
 */
export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, reason }: { expenseId: string; reason: string }) =>
      expenseAPI.rejectExpense(expenseId, reason),
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["approval-history"] });
      queryClient.invalidateQueries({ queryKey: ["expense-with-approvals", variables.expenseId] });
    },
  });
}

/**
 * Hook to mark an expense as paid
 */
export function useMarkExpenseAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseId,
      ...data
    }: {
      expenseId: string;
    } & expenseAPI.MarkPaidData) => expenseAPI.markExpenseAsPaid(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
    },
  });
}

/**
 * Hook to get payment accounts for an entity (finance users)
 */
export function usePaymentAccounts(entityId?: string) {
  return useQuery({
    queryKey: ["payment-accounts", entityId],
    queryFn: () => expenseAPI.getPaymentAccounts(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to get payment accounts for admin management
 */
export function usePaymentAccountsAdmin(entityId?: string) {
  return useQuery({
    queryKey: ["payment-accounts-admin", entityId],
    queryFn: () => expenseAPI.getPaymentAccountsAdmin(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to create a payment account
 */
export function useCreatePaymentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityId,
      data,
    }: {
      entityId: string;
      data: expenseAPI.CreatePaymentAccountData;
    }) => expenseAPI.createPaymentAccount(entityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["payment-accounts-admin"] });
    },
  });
}

/**
 * Hook to update a payment account
 */
export function useUpdatePaymentAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityId,
      accountId,
      data,
    }: {
      entityId: string;
      accountId: string;
      data: expenseAPI.UpdatePaymentAccountData;
    }) => expenseAPI.updatePaymentAccount(entityId, accountId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["payment-accounts-admin"] });
    },
  });
}

/**
 * Hook to get QuickBooks chart of accounts (finance user access)
 */
export function useQuickBooksChartOfAccounts(entityId?: string) {
  return useQuery({
    queryKey: ["quickbooks-chart-of-accounts", entityId],
    queryFn: () => expenseAPI.getQuickBooksChartOfAccountsForFinance(entityId!),
    enabled: !!entityId,
  });
}

// ==================== QuickBooks Hooks ====================

/**
 * Hook to get QuickBooks connection status for an entity
 */
export function useQuickBooksStatus(entityId?: string) {
  return useQuery({
    queryKey: ["quickbooks-status", entityId],
    queryFn: () => expenseAPI.getQuickBooksStatus(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to test QuickBooks connection
 */
export function useTestQuickBooksConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entityId: string) => expenseAPI.testQuickBooksConnection(entityId),
    onSuccess: (_, entityId) => {
      queryClient.invalidateQueries({ queryKey: ["quickbooks-status", entityId] });
    },
  });
}

/**
 * Hook to disconnect QuickBooks
 */
export function useDisconnectQuickBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entityId: string) => expenseAPI.disconnectQuickBooks(entityId),
    onSuccess: (_, entityId) => {
      queryClient.invalidateQueries({ queryKey: ["quickbooks-status", entityId] });
    },
  });
}

/**
 * Hook to post an expense to QuickBooks
 */
export function usePostToQuickBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseId,
      creditAccountName,
    }: {
      expenseId: string;
      creditAccountName?: string;
    }) => expenseAPI.postExpenseToQuickBooks(expenseId, creditAccountName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["expense-with-approvals", variables.expenseId],
      });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

/**
 * Hook to sync QuickBooks budgets
 */
export function useSyncQuickBooksBudgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityId, fiscalYear }: { entityId: string; fiscalYear?: number }) =>
      expenseAPI.syncQuickBooksBudgets(entityId, fiscalYear),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"] });
      queryClient.invalidateQueries({ queryKey: ["quickbooks-sync-status"] });
    },
  });
}

/**
 * Hook to get QuickBooks budget sync status
 */
export function useQuickBooksSyncStatus(entityId?: string) {
  return useQuery({
    queryKey: ["quickbooks-sync-status", entityId],
    queryFn: () => expenseAPI.getQuickBooksSyncStatus(entityId!),
    enabled: !!entityId,
  });
}

// ==================== Approval Workflow Admin Hooks ====================

/**
 * Hook to list approval workflows for an entity
 */
export function useApprovalWorkflows(entityId?: string) {
  return useQuery({
    queryKey: ["approval-workflows", entityId],
    queryFn: () => expenseAPI.getApprovalWorkflows(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to create an approval workflow
 */
export function useCreateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityId,
      data,
    }: {
      entityId: string;
      data: Parameters<typeof expenseAPI.createApprovalWorkflow>[1];
    }) => expenseAPI.createApprovalWorkflow(entityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-workflows"] });
    },
  });
}

/**
 * Hook to update an approval workflow
 */
export function useUpdateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workflowId,
      data,
    }: {
      workflowId: string;
      data: Parameters<typeof expenseAPI.updateApprovalWorkflow>[1];
    }) => expenseAPI.updateApprovalWorkflow(workflowId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-workflows"] });
    },
  });
}

/**
 * Hook to delete an approval workflow
 */
export function useDeleteApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workflowId: string) => expenseAPI.deleteApprovalWorkflow(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approval-workflows"] });
    },
  });
}
