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
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["expense-summary", entityId],
    queryFn: () => expenseAPI.getExpenseSummary(entityId),
    enabled: !!entityId,
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
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["expenses", entityId, params],
    queryFn: () =>
      expenseAPI.listExpenses({
        entityId,
        submitterId: params.submitterId || user?.id,
        statusFilter: params.statusFilter === "all" ? undefined : params.statusFilter,
        departmentId: params.departmentId,
      }),
    enabled: !!entityId,
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: { designation: string; days: number; calculationDate?: string }) =>
      expenseAPI.calculatePerDiem({
        entityId: user?.entity_id || "",
        ...data,
      }),
  });
}

/**
 * Hook to get departments
 */
export function useDepartments(entityId?: string) {
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useQuery({
    queryKey: ["departments", selectedEntityId],
    queryFn: () => expenseAPI.getDepartments(selectedEntityId),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to get expense categories
 */
export function useExpenseCategories(entityId?: string) {
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useQuery({
    queryKey: ["expense-categories", selectedEntityId],
    queryFn: () => expenseAPI.getExpenseCategories(selectedEntityId),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to get budgets
 */
export function useBudgets() {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["budgets", entityId],
    queryFn: () => expenseAPI.getBudgets(entityId),
    enabled: !!entityId,
  });
}

/**
 * Hook to get per diem rates
 */
export function usePerDiemRates(entityId?: string) {
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useQuery({
    queryKey: ["per-diem-rates", selectedEntityId],
    queryFn: () => expenseAPI.getPerDiemRates(selectedEntityId),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to create per diem rate
 */
export function useCreatePerDiemRate(entityId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createPerDiemRate>[1]) =>
      expenseAPI.createPerDiemRate(selectedEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["per-diem-rates"] });
    },
  });
}

/**
 * Hook to get job roles
 */
export function useJobRoles(entityId?: string) {
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useQuery({
    queryKey: ["job-roles", selectedEntityId],
    queryFn: () => expenseAPI.getJobRoles(selectedEntityId),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to create job role
 */
export function useCreateJobRole(entityId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createJobRole>[1]) =>
      expenseAPI.createJobRole(selectedEntityId, data),
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
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createDepartment>[1]) =>
      expenseAPI.createDepartment(selectedEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

/**
 * Hook to get branches
 */
export function useBranches(entityId?: string) {
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useQuery({
    queryKey: ["branches", selectedEntityId],
    queryFn: () => expenseAPI.getBranches(selectedEntityId),
    enabled: !!selectedEntityId,
  });
}

/**
 * Hook to create branch
 */
export function useCreateBranch(entityId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createBranch>[1]) =>
      expenseAPI.createBranch(selectedEntityId, data),
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
  const { user } = useAuth();
  const selectedEntityId = entityId || user?.entity_id || "";

  return useMutation({
    mutationFn: (data: Parameters<typeof expenseAPI.createExpenseCategory>[1]) =>
      expenseAPI.createExpenseCategory(selectedEntityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
    },
  });
}
