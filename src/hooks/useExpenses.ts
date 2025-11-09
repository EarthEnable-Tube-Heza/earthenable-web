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
export function useDepartments() {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["departments", entityId],
    queryFn: () => expenseAPI.getDepartments(entityId),
    enabled: !!entityId,
  });
}

/**
 * Hook to get expense categories
 */
export function useExpenseCategories() {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["expense-categories", entityId],
    queryFn: () => expenseAPI.getExpenseCategories(entityId),
    enabled: !!entityId,
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
export function usePerDiemRates() {
  const { user } = useAuth();
  const entityId = user?.entity_id || "";

  return useQuery({
    queryKey: ["per-diem-rates", entityId],
    queryFn: () => expenseAPI.getPerDiemRates(entityId),
    enabled: !!entityId,
  });
}
