"use client";

/**
 * My Expenses Tab
 *
 * Shows user's own expenses with table view, search, filters, bulk actions, and pagination
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Button,
  LabeledSelect,
  Badge,
  Card,
  Spinner,
  ResultModal,
  ConfirmDialog,
} from "@/src/components/ui";
import type { ResultModalVariant } from "@/src/components/ui/ResultModal";
import { useExpenses, useSubmitExpense, useDeleteExpense } from "@/src/hooks/useExpenses";
import {
  Search,
  Wallet,
  Eye,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
} from "@/src/lib/icons";

interface ModalState {
  isOpen: boolean;
  variant: ResultModalVariant;
  title: string;
  message: string;
  secondaryMessage?: string;
  actionLabel?: string;
  secondaryActionLabel?: string;
  onAction: () => void;
  onSecondaryAction?: () => void;
}

const initialModalState: ModalState = {
  isOpen: false,
  variant: "info",
  title: "",
  message: "",
  onAction: () => {},
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function MyExpensesTab() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<ModalState>(initialModalState);
  const [pendingExpenseId, setPendingExpenseId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection state for bulk actions
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  // Bulk action confirm dialog
  const [bulkAction, setBulkAction] = useState<{
    type: "submit" | "delete" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });

  const { data, isLoading, refetch } = useExpenses({
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
  });

  const submitMutation = useSubmitExpense();
  const deleteMutation = useDeleteExpense();

  const expenses = useMemo(() => data?.expenses || [], [data?.expenses]);

  // Helper to get category name (handles both snake_case and camelCase)
  const getCategoryName = (expense: (typeof expenses)[0]) => {
    return expense.category_name || expense.categoryName || "-";
  };

  // Helper to get expense type (handles both snake_case and camelCase)
  const getExpenseType = (expense: (typeof expenses)[0]) => {
    return expense.expense_type || expense.expenseType || "expense";
  };

  // Filter expenses by search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const query = searchQuery.toLowerCase();
    return expenses.filter(
      (expense) =>
        expense.title.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query) ||
        (expense.category_name || expense.categoryName || "").toLowerCase().includes(query)
    );
  }, [expenses, searchQuery]);

  // Paginate filtered expenses
  const totalPages = Math.ceil(filteredExpenses.length / pageSize);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage, pageSize]);

  // Reset page when filters change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setSelectedExpenses(new Set());
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setSelectedExpenses(new Set());
  };

  // Helper to safely format date (handles both expense_date and expenseDate due to backend alias)
  const formatExpenseDate = (expense: (typeof expenses)[0]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateValue = expense.expense_date || (expense as any).expenseDate;
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const closeModal = () => {
    setModal(initialModalState);
    setPendingExpenseId(null);
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedExpenses.size === paginatedExpenses.length) {
      setSelectedExpenses(new Set());
    } else {
      setSelectedExpenses(new Set(paginatedExpenses.map((e) => e.id)));
    }
  };

  const toggleSelectExpense = (expenseId: string) => {
    const newSelected = new Set(selectedExpenses);
    if (newSelected.has(expenseId)) {
      newSelected.delete(expenseId);
    } else {
      newSelected.add(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  // Get selected expenses that can be submitted (drafts only)
  const selectedDrafts = useMemo(() => {
    return paginatedExpenses.filter((e) => selectedExpenses.has(e.id) && e.status === "draft");
  }, [paginatedExpenses, selectedExpenses]);

  // Get selected expenses that can be deleted (drafts only)
  const selectedDeletable = useMemo(() => {
    return paginatedExpenses.filter((e) => selectedExpenses.has(e.id) && e.status === "draft");
  }, [paginatedExpenses, selectedExpenses]);

  const showConfirmSubmit = (expense: (typeof expenses)[0]) => {
    setPendingExpenseId(expense.id);
    setModal({
      isOpen: true,
      variant: "warning",
      title: "Submit for Approval?",
      message: `Are you sure you want to submit "${expense.title}" for ${formatCurrency(expense.amount, expense.currency)}?`,
      secondaryMessage:
        "Once submitted, you won't be able to edit this expense. It will be sent to your approver for review.",
      actionLabel: "Submit",
      secondaryActionLabel: "Cancel",
      onAction: () => executeSubmit(expense.id, expense.title, expense.amount, expense.currency),
      onSecondaryAction: closeModal,
    });
  };

  const executeSubmit = async (
    expenseId: string,
    title: string,
    amount: number,
    currency: string
  ) => {
    setModal((prev) => ({ ...prev, isOpen: false }));

    try {
      await submitMutation.mutateAsync(expenseId);

      setModal({
        isOpen: true,
        variant: "success",
        title: "Expense Submitted",
        message: `Your expense "${title}" for ${formatCurrency(amount, currency)} has been submitted successfully.`,
        secondaryMessage:
          "Your request is now pending approval. You will be notified once it has been reviewed.",
        actionLabel: "Done",
        onAction: closeModal,
      });
    } catch (error) {
      console.error("Failed to submit expense:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      const apiError = axiosError?.response?.data?.detail || "";

      setModal({
        isOpen: true,
        variant: "error",
        title: "Submission Failed",
        message: apiError || "We couldn't submit your expense request.",
        secondaryMessage: !apiError
          ? "Please check your connection and try again. If the problem persists, contact support."
          : undefined,
        actionLabel: "OK",
        onAction: closeModal,
      });
    } finally {
      setPendingExpenseId(null);
    }
  };

  const showConfirmDelete = (expense: (typeof expenses)[0]) => {
    setPendingExpenseId(expense.id);
    setModal({
      isOpen: true,
      variant: "error",
      title: "Delete Expense?",
      message: `Are you sure you want to delete "${expense.title}"?`,
      secondaryMessage: "This action cannot be undone.",
      actionLabel: "Delete",
      secondaryActionLabel: "Cancel",
      onAction: () => executeDelete(expense.id, expense.title),
      onSecondaryAction: closeModal,
    });
  };

  const executeDelete = async (expenseId: string, title: string) => {
    setModal((prev) => ({ ...prev, isOpen: false }));

    try {
      await deleteMutation.mutateAsync(expenseId);

      setModal({
        isOpen: true,
        variant: "success",
        title: "Expense Deleted",
        message: `"${title}" has been deleted successfully.`,
        actionLabel: "Done",
        onAction: closeModal,
      });
    } catch (error) {
      console.error("Failed to delete expense:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      const apiError = axiosError?.response?.data?.detail || "";

      setModal({
        isOpen: true,
        variant: "error",
        title: "Deletion Failed",
        message: apiError || "We couldn't delete this expense.",
        secondaryMessage: !apiError ? "Please check your connection and try again." : undefined,
        actionLabel: "OK",
        onAction: closeModal,
      });
    } finally {
      setPendingExpenseId(null);
    }
  };

  // Bulk actions
  const executeBulkSubmit = async () => {
    setBulkAction({ type: null, isOpen: false });
    let successCount = 0;
    let failCount = 0;

    for (const expense of selectedDrafts) {
      try {
        await submitMutation.mutateAsync(expense.id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSelectedExpenses(new Set());
    refetch();

    setModal({
      isOpen: true,
      variant: failCount === 0 ? "success" : "warning",
      title: "Bulk Submit Complete",
      message:
        failCount === 0
          ? `Successfully submitted ${successCount} expense(s).`
          : `Submitted ${successCount} expense(s). ${failCount} failed.`,
      actionLabel: "Done",
      onAction: closeModal,
    });
  };

  const executeBulkDelete = async () => {
    setBulkAction({ type: null, isOpen: false });
    let successCount = 0;
    let failCount = 0;

    for (const expense of selectedDeletable) {
      try {
        await deleteMutation.mutateAsync(expense.id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSelectedExpenses(new Set());
    refetch();

    setModal({
      isOpen: true,
      variant: failCount === 0 ? "success" : "warning",
      title: "Bulk Delete Complete",
      message:
        failCount === 0
          ? `Successfully deleted ${successCount} expense(s).`
          : `Deleted ${successCount} expense(s). ${failCount} failed.`,
      actionLabel: "Done",
      onAction: closeModal,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "warning" | "success" | "error"> = {
      draft: "default",
      submitted: "warning",
      approved: "success",
      rejected: "error",
      paid: "success",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getExpenseTypeBadge = (type: string) => {
    const badges = {
      expense: { variant: "default" as const, label: "Regular" },
      per_diem: { variant: "warning" as const, label: "Per Diem" },
      advance: { variant: "info" as const, label: "Advance" },
    };
    const config = badges[type as keyof typeof badges] || {
      variant: "default" as const,
      label: type,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isAllSelected =
    paginatedExpenses.length > 0 && selectedExpenses.size === paginatedExpenses.length;
  const isSomeSelected = selectedExpenses.size > 0;

  return (
    <>
      {/* Modal for confirmation and results */}
      <ResultModal
        isOpen={modal.isOpen}
        variant={modal.variant}
        title={modal.title}
        message={modal.message}
        secondaryMessage={modal.secondaryMessage}
        actionLabel={modal.actionLabel || "OK"}
        secondaryActionLabel={modal.secondaryActionLabel}
        onAction={modal.onAction}
        onSecondaryAction={modal.onSecondaryAction}
      />

      {/* Bulk action confirm dialogs */}
      <ConfirmDialog
        isOpen={bulkAction.isOpen && bulkAction.type === "submit"}
        title="Submit Selected Expenses?"
        message={`Are you sure you want to submit ${selectedDrafts.length} draft expense(s) for approval?`}
        confirmLabel="Submit All"
        confirmVariant="primary"
        onConfirm={executeBulkSubmit}
        onCancel={() => setBulkAction({ type: null, isOpen: false })}
      />

      <ConfirmDialog
        isOpen={bulkAction.isOpen && bulkAction.type === "delete"}
        title="Delete Selected Expenses?"
        message={`Are you sure you want to delete ${selectedDeletable.length} expense(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        confirmVariant="danger"
        onConfirm={executeBulkDelete}
        onCancel={() => setBulkAction({ type: null, isOpen: false })}
      />

      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <LabeledSelect
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "submitted", label: "Pending Approval" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "paid", label: "Paid" },
            ]}
          />
          <LabeledSelect
            value={pageSize.toString()}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            options={PAGE_SIZE_OPTIONS.map((size) => ({
              value: size.toString(),
              label: `${size} per page`,
            }))}
          />
        </div>

        {/* Bulk Actions Bar */}
        {isSomeSelected && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-medium text-primary">
              {selectedExpenses.size} expense(s) selected
            </span>
            <div className="flex gap-2">
              {selectedDrafts.length > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setBulkAction({ type: "submit", isOpen: true })}
                  disabled={submitMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Submit ({selectedDrafts.length})
                </Button>
              )}
              {selectedDeletable.length > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setBulkAction({ type: "delete", isOpen: true })}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete ({selectedDeletable.length})
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelectedExpenses(new Set())}>
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Expense Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" variant="primary" />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <Card variant="bordered">
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {searchQuery ? "No matching expenses" : "No expenses found"}
              </h3>
              <p className="text-text-secondary">
                {searchQuery
                  ? "Try adjusting your search or filters."
                  : "You haven't created any expense requests yet."}
              </p>
              {!searchQuery && (
                <p className="text-text-secondary mb-4">
                  Click &quot;New Request&quot; tab to create your first expense.
                </p>
              )}
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto border border-border-primary rounded-lg">
            <table className="w-full min-w-[800px]">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border-primary text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {paginatedExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className={`hover:bg-background-secondary/50 ${
                      selectedExpenses.has(expense.id) ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.has(expense.id)}
                        onChange={() => toggleSelectExpense(expense.id)}
                        className="w-4 h-4 rounded border-border-primary text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{expense.title}</p>
                        {expense.description && (
                          <p className="text-sm text-text-secondary truncate max-w-[200px]">
                            {expense.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {formatCurrency(expense.amount, expense.currency)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">
                      {formatExpenseDate(expense)}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-sm">
                      {getCategoryName(expense)}
                    </td>
                    <td className="px-4 py-3">{getExpenseTypeBadge(getExpenseType(expense))}</td>
                    <td className="px-4 py-3">{getStatusBadge(expense.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/expenses/${expense.id}`)}
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {expense.status === "draft" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/expenses/${expense.id}/edit`)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showConfirmSubmit(expense)}
                              loading={submitMutation.isPending && pendingExpenseId === expense.id}
                              disabled={submitMutation.isPending && pendingExpenseId !== expense.id}
                              title="Submit for approval"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => showConfirmDelete(expense)}
                              loading={deleteMutation.isPending && pendingExpenseId === expense.id}
                              disabled={deleteMutation.isPending && pendingExpenseId !== expense.id}
                              title="Delete"
                              className="text-error hover:bg-error/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredExpenses.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-border-primary">
            <p className="text-sm text-text-secondary">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredExpenses.length)} of{" "}
              {filteredExpenses.length} expenses
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 text-sm text-text-primary">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
