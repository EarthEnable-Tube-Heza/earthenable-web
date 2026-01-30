"use client";

/**
 * All Expenses Tab (Admin Only)
 *
 * Shows all expenses across the organization with table view, search, filters, bulk actions, and pagination
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
  ConfirmDialog,
  ResultModal,
} from "@/src/components/ui";
import type { ResultModalVariant } from "@/src/components/ui/ResultModal";
import {
  Search,
  RefreshCw,
  BarChart,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "@/src/lib/icons";
import {
  useExpenses,
  useDepartments,
  useExpenseCategories,
  usePendingApprovals,
  useApproveExpense,
  useRejectExpense,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import { Expense, PendingApprovalItem } from "@/src/lib/api/expenseClient";

// Approve modal component
function ApproveModal({
  isOpen,
  expense,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  expense: Expense | PendingApprovalItem | null;
  onClose: () => void;
  onConfirm: (comments: string) => void;
  isLoading: boolean;
}) {
  const [comments, setComments] = useState("");

  if (!isOpen || !expense) return null;

  const title = "title" in expense ? expense.title : expense.expenseTitle;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-2">Approve Expense</h3>
        <p className="text-gray-600 mb-4">
          Approve <span className="font-medium">&quot;{title}&quot;</span>?
        </p>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add comments (optional)"
          className="w-full border rounded-lg p-3 mb-4 h-24 resize-none"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onConfirm(comments)} loading={isLoading}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

// Reject modal component
function RejectModal({
  isOpen,
  expense,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  expense: Expense | PendingApprovalItem | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !expense) return null;

  const title = "title" in expense ? expense.title : expense.expenseTitle;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-2 text-error">Reject Expense</h3>
        <p className="text-gray-600 mb-4">
          Reject <span className="font-medium">&quot;{title}&quot;</span>?
        </p>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          placeholder="Rejection reason (required)"
          className={`w-full border rounded-lg p-3 mb-2 h-24 resize-none ${error ? "border-error" : ""}`}
        />
        {error && <p className="text-error text-sm mb-4">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={isLoading}>
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ModalState {
  isOpen: boolean;
  variant: ResultModalVariant;
  title: string;
  message: string;
}

const initialModalState: ModalState = {
  isOpen: false,
  variant: "info",
  title: "",
  message: "",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function AllExpensesTab() {
  const router = useRouter();
  const { user, selectedEntityId } = useAuth();
  const entityId = selectedEntityId || user?.entity_id || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    expenseType: "all",
    departmentId: "",
    categoryId: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selection state for bulk actions
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());

  // Bulk action state
  const [bulkAction, setBulkAction] = useState<{
    type: "approve" | "reject" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  // Result modal state
  const [resultModal, setResultModal] = useState<ModalState>(initialModalState);

  // Modal state for single actions
  const [approveTarget, setApproveTarget] = useState<Expense | PendingApprovalItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Expense | PendingApprovalItem | null>(null);

  // Fetch data
  const {
    data: expensesData,
    isLoading: expensesLoading,
    refetch,
  } = useExpenses({
    statusFilter: filters.status === "all" ? undefined : filters.status,
    departmentId: filters.departmentId || undefined,
    submitterId: undefined, // Show all submitters for admin view
  });

  const { data: pendingData, isLoading: pendingLoading } = usePendingApprovals(entityId);
  const { data: departmentsData } = useDepartments(entityId);
  const { data: categoriesData } = useExpenseCategories(entityId);

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const expenses = useMemo(() => expensesData?.expenses || [], [expensesData?.expenses]);
  const pendingApprovals = pendingData?.approvals || [];
  const departments = departmentsData?.departments || [];
  const categories = categoriesData?.categories || [];

  // Filter expenses by search query and expense type
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    // Filter by expense type (client-side since API might not support it)
    if (filters.expenseType !== "all") {
      result = result.filter((e) => (e.expense_type || e.expenseType) === filters.expenseType);
    }

    // Filter by category (client-side)
    if (filters.categoryId) {
      result = result.filter((e) => e.category_id === filters.categoryId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.title.toLowerCase().includes(query) ||
          expense.description?.toLowerCase().includes(query) ||
          (expense.submitter_name || expense.submitterName || "").toLowerCase().includes(query) ||
          (expense.department_name || expense.departmentName || "").toLowerCase().includes(query) ||
          (expense.category_name || expense.categoryName || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [expenses, searchQuery, filters.expenseType, filters.categoryId]);

  // Paginate filtered expenses
  const totalPages = Math.ceil(filteredExpenses.length / pageSize);
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage, pageSize]);

  // Reset page when filters change
  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1);
    setSelectedExpenses(new Set());
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setSelectedExpenses(new Set());
  };

  // Helper to safely format date (handles both snake_case and camelCase)
  const formatExpenseDate = (expense: Expense) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateValue = expense.expense_date || (expense as any).expenseDate;
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString();
  };

  // Helper to get submitter name (handles both snake_case and camelCase)
  const getSubmitterName = (expense: Expense) => {
    return expense.submitter_name || expense.submitterName || "Unknown";
  };

  // Helper to get department name (handles both snake_case and camelCase)
  const getDepartmentName = (expense: Expense) => {
    return expense.department_name || expense.departmentName || "-";
  };

  // Helper to get category name (handles both snake_case and camelCase)
  const getCategoryName = (expense: Expense) => {
    return expense.category_name || expense.categoryName || "-";
  };

  // Helper to get expense type (handles both snake_case and camelCase)
  const getExpenseType = (expense: Expense) => {
    return expense.expense_type || expense.expenseType || "expense";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "warning" | "success" | "error" | "info"> = {
      draft: "default",
      submitted: "warning",
      approved: "success",
      rejected: "error",
      paid: "info",
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleReset = () => {
    setFilters({
      status: "all",
      expenseType: "all",
      departmentId: "",
      categoryId: "",
    });
    setSearchQuery("");
    setCurrentPage(1);
    setSelectedExpenses(new Set());
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

  // Get selected expenses that can be approved/rejected (submitted only)
  const selectedApprovable = useMemo(() => {
    return paginatedExpenses.filter((e) => selectedExpenses.has(e.id) && e.status === "submitted");
  }, [paginatedExpenses, selectedExpenses]);

  const handleApprove = async (comments: string) => {
    if (!approveTarget) return;
    const expenseId = "id" in approveTarget ? approveTarget.id : approveTarget.expenseId;
    try {
      await approveMutation.mutateAsync({ expenseId, comments });
      setApproveTarget(null);
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    const expenseId = "id" in rejectTarget ? rejectTarget.id : rejectTarget.expenseId;
    try {
      await rejectMutation.mutateAsync({ expenseId, reason });
      setRejectTarget(null);
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  // Bulk actions
  const executeBulkApprove = async () => {
    setBulkAction({ type: null, isOpen: false });
    let successCount = 0;
    let failCount = 0;

    for (const expense of selectedApprovable) {
      try {
        await approveMutation.mutateAsync({ expenseId: expense.id, comments: "" });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSelectedExpenses(new Set());
    refetch();

    setResultModal({
      isOpen: true,
      variant: failCount === 0 ? "success" : "warning",
      title: "Bulk Approve Complete",
      message:
        failCount === 0
          ? `Successfully approved ${successCount} expense(s).`
          : `Approved ${successCount} expense(s). ${failCount} failed.`,
    });
  };

  const executeBulkReject = async () => {
    if (!bulkRejectReason.trim()) return;

    setBulkAction({ type: null, isOpen: false });
    let successCount = 0;
    let failCount = 0;

    for (const expense of selectedApprovable) {
      try {
        await rejectMutation.mutateAsync({ expenseId: expense.id, reason: bulkRejectReason });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSelectedExpenses(new Set());
    setBulkRejectReason("");
    refetch();

    setResultModal({
      isOpen: true,
      variant: failCount === 0 ? "success" : "warning",
      title: "Bulk Reject Complete",
      message:
        failCount === 0
          ? `Successfully rejected ${successCount} expense(s).`
          : `Rejected ${successCount} expense(s). ${failCount} failed.`,
    });
  };

  const navigateToDetail = (expenseId: string) => {
    router.push(`/dashboard/expenses/${expenseId}`);
  };

  const isAllSelected =
    paginatedExpenses.length > 0 && selectedExpenses.size === paginatedExpenses.length;
  const isSomeSelected = selectedExpenses.size > 0;

  return (
    <div className="space-y-4">
      {/* Result Modal */}
      <ResultModal
        isOpen={resultModal.isOpen}
        variant={resultModal.variant}
        title={resultModal.title}
        message={resultModal.message}
        actionLabel="Done"
        onAction={() => setResultModal(initialModalState)}
      />

      {/* Bulk Approve Confirm */}
      <ConfirmDialog
        isOpen={bulkAction.isOpen && bulkAction.type === "approve"}
        title="Approve Selected Expenses?"
        message={`Are you sure you want to approve ${selectedApprovable.length} expense(s)?`}
        confirmLabel="Approve All"
        confirmVariant="primary"
        onConfirm={executeBulkApprove}
        onCancel={() => setBulkAction({ type: null, isOpen: false })}
      />

      {/* Bulk Reject Modal */}
      {bulkAction.isOpen && bulkAction.type === "reject" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-2 text-error">
              Reject {selectedApprovable.length} Expense(s)
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting these expenses.
            </p>
            <textarea
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="Rejection reason (required)"
              className="w-full border rounded-lg p-3 mb-4 h-24 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setBulkAction({ type: null, isOpen: false });
                  setBulkRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={executeBulkReject}
                disabled={!bulkRejectReason.trim()}
              >
                Reject All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approvals Section */}
      {pendingApprovals.length > 0 && (
        <Card variant="bordered" padding="md" className="border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">
              Pending Your Approval ({pendingApprovals.length})
            </h3>
          </div>
          <div className="space-y-3">
            {pendingApprovals.slice(0, 5).map((item) => (
              <div
                key={item.approvalId}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.expenseTitle}</span>
                    {getExpenseTypeBadge(item.expenseType)}
                    <Badge variant="warning" size="sm">
                      Step {item.stepOrder}/{item.totalSteps}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {item.submitterName || "Unknown"} &middot; {item.departmentName || "N/A"}{" "}
                    &middot; {formatCurrency(item.expenseAmount, item.expenseCurrency)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={() => setApproveTarget(item)}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRejectTarget(item)}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToDetail(item.expenseId)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pendingApprovals.length > 5 && (
              <p className="text-sm text-center text-gray-500">
                And {pendingApprovals.length - 5} more pending approvals...
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <LabeledSelect
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "submitted", label: "Pending Approval" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "paid", label: "Paid" },
            ]}
          />

          {/* Expense Type Filter */}
          <LabeledSelect
            value={filters.expenseType}
            onChange={(e) => handleFilterChange("expenseType", e.target.value)}
            options={[
              { value: "all", label: "All Types" },
              { value: "expense", label: "Regular Expense" },
              { value: "per_diem", label: "Per Diem" },
              { value: "advance", label: "Advance Payment" },
            ]}
          />

          {/* Department Filter */}
          <LabeledSelect
            value={filters.departmentId}
            onChange={(e) => handleFilterChange("departmentId", e.target.value)}
            options={[
              { value: "", label: "All Departments" },
              ...departments.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          {/* Category Filter */}
          <LabeledSelect
            value={filters.categoryId}
            onChange={(e) => handleFilterChange("categoryId", e.target.value)}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          {/* Page Size */}
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

          {/* Action Buttons */}
          <div className="md:col-span-3 flex gap-3 items-end">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="secondary" disabled>
              <BarChart className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {isSomeSelected && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            {selectedExpenses.size} expense(s) selected
          </span>
          <div className="flex gap-2">
            {selectedApprovable.length > 0 && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setBulkAction({ type: "approve", isOpen: true })}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve ({selectedApprovable.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkAction({ type: "reject", isOpen: true })}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject ({selectedApprovable.length})
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedExpenses(new Set())}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Expense Table */}
      {expensesLoading || pendingLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {searchQuery || filters.status !== "all"
                ? "No matching expenses"
                : "No expenses found"}
            </h3>
            <p className="text-text-secondary">
              {searchQuery || filters.status !== "all"
                ? "Try adjusting your search or filters."
                : "Check back later for new expenses."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto border border-border-primary rounded-lg">
          <table className="w-full min-w-[1100px]">
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
                  Submitter
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Department
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
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {getSubmitterName(expense)}
                  </td>
                  <td className="px-4 py-3 text-text-primary font-medium">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {formatExpenseDate(expense)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {getDepartmentName(expense)}
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
                        onClick={() => navigateToDetail(expense.id)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {expense.status === "submitted" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setApproveTarget(expense)}
                            title="Approve"
                            className="text-success hover:bg-success/10"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRejectTarget(expense)}
                            title="Reject"
                            className="text-error hover:bg-error/10"
                          >
                            <XCircle className="w-4 h-4" />
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
            {Math.min(currentPage * pageSize, filteredExpenses.length)} of {filteredExpenses.length}{" "}
            expenses
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

      {/* Single Action Modals */}
      <ApproveModal
        isOpen={!!approveTarget}
        expense={approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        isLoading={approveMutation.isPending}
      />
      <RejectModal
        isOpen={!!rejectTarget}
        expense={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
