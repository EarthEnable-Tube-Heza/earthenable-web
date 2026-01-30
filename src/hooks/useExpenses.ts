/**
 * React Query hooks for expense management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expenseAPI from "@/src/lib/api/expenseClient";
import { useAuth } from "@/src/lib/auth";

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
}) {
  const { user, selectedEntityId } = useAuth();

  return useQuery({
    queryKey: ["expenses", selectedEntityId, params],
    queryFn: () =>
      expenseAPI.listExpenses({
        entityId: selectedEntityId || "",
        submitterId: params.submitterId || user?.id,
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
export function useBudgets() {
  const { selectedEntityId } = useAuth();

  return useQuery({
    queryKey: ["budgets", selectedEntityId],
    queryFn: () => expenseAPI.getBudgets(selectedEntityId || ""),
    enabled: !!selectedEntityId,
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
  const { selectedEntityId: globalEntityId } = useAuth();
  const finalEntityId = entityId || globalEntityId || undefined;

  return useQuery({
    queryKey: ["pending-approvals", finalEntityId],
    queryFn: () => expenseAPI.getPendingApprovals(finalEntityId),
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
      queryClient.invalidateQueries({ queryKey: ["expense-with-approvals", variables.expenseId] });
    },
  });
}
