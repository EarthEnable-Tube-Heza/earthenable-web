"use client";

/**
 * All Expenses Tab (Admin Only)
 *
 * Shows all expenses across the organization with table view, search, filters, bulk actions, and pagination
 */

import { useState, useMemo, useEffect } from "react";
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
  useBudgets,
  useMarkExpenseAsPaid,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import { Expense, PendingApprovalItem, Budget } from "@/src/lib/api/expenseClient";
import { getExpenseDisplayStatus } from "@/src/utils/expenseStatus";
import { AlertTriangle, TrendingUp } from "@/src/lib/icons";

/**
 * Format currency amount
 */
function formatCurrencyAmount(amount: number, currency: string = "RWF") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Budget Impact Card - shows how approving an expense affects department budget
 */
function BudgetImpactCard({
  departmentBudget,
  expenseAmount,
  expenseCurrency,
}: {
  departmentBudget: Budget | null;
  expenseAmount: number;
  expenseCurrency: string;
}) {
  if (!departmentBudget) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-500 text-center">
          No budget configured for this department
        </p>
      </div>
    );
  }

  const currentUtilization = departmentBudget.utilizationPercentage;
  const newSpent = departmentBudget.spentAmount + expenseAmount;
  const newUtilization =
    departmentBudget.allocatedAmount > 0 ? (newSpent / departmentBudget.allocatedAmount) * 100 : 0;
  const newRemaining = departmentBudget.allocatedAmount - newSpent;
  const willExceedBudget = newUtilization > 100;
  const willBeAtRisk = newUtilization >= 85 && newUtilization <= 100;

  // Determine status color
  const getStatusColor = (util: number) => {
    if (util > 100) return "text-status-error";
    if (util >= 85) return "text-status-warning";
    return "text-status-success";
  };

  const getBarColor = (util: number) => {
    if (util > 100) return "bg-status-error";
    if (util >= 85) return "bg-status-warning";
    return "bg-status-success";
  };

  return (
    <div
      className={`rounded-lg p-4 mb-4 border ${
        willExceedBudget
          ? "bg-red-50 border-red-200"
          : willBeAtRisk
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {willExceedBudget ? (
          <TrendingUp className="w-5 h-5 text-status-error" />
        ) : willBeAtRisk ? (
          <AlertTriangle className="w-5 h-5 text-status-warning" />
        ) : (
          <BarChart className="w-5 h-5 text-status-success" />
        )}
        <span className="font-semibold text-sm">
          {departmentBudget.departmentName} Budget Impact
        </span>
      </div>

      {/* Warning message if over budget */}
      {willExceedBudget && (
        <div className="bg-red-100 text-red-800 text-sm p-2 rounded mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Approving this expense will put the department{" "}
            <strong>{formatCurrencyAmount(Math.abs(newRemaining), expenseCurrency)}</strong> over
            budget
          </span>
        </div>
      )}

      {willBeAtRisk && !willExceedBudget && (
        <div className="bg-yellow-100 text-yellow-800 text-sm p-2 rounded mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Budget will be at risk level ({newUtilization.toFixed(0)}% utilized)</span>
        </div>
      )}

      {/* Budget Stats */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-500">Budget:</span>
          <span className="ml-2 font-medium">
            {formatCurrencyAmount(departmentBudget.allocatedAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Currently Spent:</span>
          <span className="ml-2 font-medium">
            {formatCurrencyAmount(departmentBudget.spentAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">This Expense:</span>
          <span className="ml-2 font-medium text-primary">
            +{formatCurrencyAmount(expenseAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">After Approval:</span>
          <span className={`ml-2 font-medium ${getStatusColor(newUtilization)}`}>
            {formatCurrencyAmount(newSpent, expenseCurrency)}
          </span>
        </div>
      </div>

      {/* Utilization Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Current: {currentUtilization.toFixed(0)}%</span>
          <span className={`font-semibold ${getStatusColor(newUtilization)}`}>
            After: {newUtilization.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
          {/* Current utilization */}
          <div
            className={`absolute h-full ${getBarColor(currentUtilization)} opacity-50`}
            style={{ width: `${Math.min(currentUtilization, 100)}%` }}
          />
          {/* New utilization */}
          <div
            className={`absolute h-full ${getBarColor(newUtilization)}`}
            style={{ width: `${Math.min(newUtilization, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          <span>0%</span>
          <span>85%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}

// Approve modal component
function ApproveModal({
  isOpen,
  expense,
  departmentBudget,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  expense: Expense | PendingApprovalItem | null;
  departmentBudget: Budget | null;
  onClose: () => void;
  onConfirm: (comments: string) => void;
  isLoading: boolean;
}) {
  const [comments, setComments] = useState("");

  if (!isOpen || !expense) return null;

  const title = "title" in expense ? expense.title : expense.expenseTitle;
  const amount = "amount" in expense ? expense.amount : expense.expenseAmount;
  const currency = "currency" in expense ? expense.currency : expense.expenseCurrency;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Approve Expense</h3>
        <p className="text-gray-600 mb-4">
          Approve <span className="font-medium">&quot;{title}&quot;</span> for{" "}
          <span className="font-semibold text-primary">
            {formatCurrencyAmount(amount, currency)}
          </span>
          ?
        </p>

        {/* Budget Impact Card */}
        <BudgetImpactCard
          departmentBudget={departmentBudget}
          expenseAmount={amount}
          expenseCurrency={currency}
        />

        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add comments (optional)"
          className="w-full border rounded-lg p-3 mb-4 h-20 resize-none"
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
  departmentBudget,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  expense: Expense | PendingApprovalItem | null;
  departmentBudget: Budget | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !expense) return null;

  const title = "title" in expense ? expense.title : expense.expenseTitle;
  const amount = "amount" in expense ? expense.amount : expense.expenseAmount;
  const currency = "currency" in expense ? expense.currency : expense.expenseCurrency;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-error">Reject Expense</h3>
        <p className="text-gray-600 mb-4">
          Reject <span className="font-medium">&quot;{title}&quot;</span> for{" "}
          <span className="font-semibold">{formatCurrencyAmount(amount, currency)}</span>?
        </p>

        {/* Budget Context - helps approver understand if rejection is budget-related */}
        <BudgetImpactCard
          departmentBudget={departmentBudget}
          expenseAmount={amount}
          expenseCurrency={currency}
        />

        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          placeholder="Rejection reason (required)"
          className={`w-full border rounded-lg p-3 mb-2 h-20 resize-none ${error ? "border-error" : ""}`}
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

export type ExpenseStatusFilter = "all" | "draft" | "submitted" | "approved" | "rejected" | "paid";

interface AllExpensesTabProps {
  initialStatusFilter?: ExpenseStatusFilter;
}

export function AllExpensesTab({ initialStatusFilter }: AllExpensesTabProps) {
  const router = useRouter();
  const { user, selectedEntityId } = useAuth();
  const entityId = selectedEntityId || user?.entity_id || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: initialStatusFilter || "all",
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

  // Update filter when initialStatusFilter prop changes
  useEffect(() => {
    if (initialStatusFilter) {
      setFilters((prev) => ({ ...prev, status: initialStatusFilter }));
      setCurrentPage(1);
    }
  }, [initialStatusFilter]);

  // Fetch data
  const {
    data: expensesData,
    isLoading: expensesLoading,
    refetch,
  } = useExpenses({
    statusFilter: filters.status === "all" ? undefined : filters.status,
    departmentId: filters.departmentId || undefined,
    allSubmitters: true, // Show all submitters for admin view
  });

  const { data: pendingData, isLoading: pendingLoading } = usePendingApprovals(entityId);
  const { data: departmentsData } = useDepartments(entityId);
  const { data: categoriesData } = useExpenseCategories(entityId);
  const { data: budgetsData } = useBudgets();

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const markPaidMutation = useMarkExpenseAsPaid();

  const expenses = useMemo(() => expensesData?.expenses || [], [expensesData?.expenses]);
  const pendingApprovals = pendingData?.approvals || [];
  const departments = departmentsData?.departments || [];
  const categories = categoriesData?.categories || [];
  const budgets = useMemo(() => budgetsData?.budgets || [], [budgetsData?.budgets]);

  // Helper to find department budget for an expense
  const getDepartmentBudget = useMemo(() => {
    // Create a map of departmentId -> overall budget (category_id is null)
    const budgetMap = new Map<string, Budget>();
    budgets.forEach((budget) => {
      // Only use department-level budgets (no category)
      if (!budget.categoryId) {
        budgetMap.set(budget.departmentId, budget);
      }
    });
    return (departmentId: string | undefined): Budget | null => {
      if (!departmentId) return null;
      return budgetMap.get(departmentId) || null;
    };
  }, [budgets]);

  // Get budget for current approve/reject target
  const getTargetBudget = (target: Expense | PendingApprovalItem | null): Budget | null => {
    if (!target) return null;
    // Get department ID from either expense (snake_case) or pending approval (camelCase)
    let deptId: string | undefined;
    if ("department_id" in target && target.department_id) {
      deptId = target.department_id;
    } else if ("departmentId" in target && target.departmentId) {
      deptId = target.departmentId;
    }
    return getDepartmentBudget(deptId);
  };

  // Filter expenses by search query and expense type
  const filteredExpenses = useMemo(() => {
    let result = expenses;

    // Filter by expense type code (client-side)
    if (filters.expenseType !== "all") {
      result = result.filter(
        (e) => (e.expense_type_code || e.expenseTypeCode) === filters.expenseType
      );
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

  // Helpers to get expense type fields (handles both snake_case and camelCase)
  const getExpenseTypeName = (expense: Expense) => {
    return expense.expense_type_name || expense.expenseTypeName || "-";
  };
  const getExpenseTypeCode = (expense: Expense) => {
    return expense.expense_type_code || expense.expenseTypeCode || "expense";
  };

  const getStatusBadge = (expense: Expense) => {
    const { label, variant } = getExpenseDisplayStatus(expense);
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getExpenseTypeBadge = (code: string, name: string) => {
    const variants: Record<string, "default" | "warning" | "info"> = {
      expense: "default",
      per_diem: "warning",
      advance: "info",
    };
    const variant = variants[code] || "default";
    return <Badge variant={variant}>{name || code}</Badge>;
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
                    {getExpenseTypeBadge(item.expenseTypeCode || "", item.expenseTypeName || "")}
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
                  <td className="px-4 py-3">
                    {getExpenseTypeBadge(getExpenseTypeCode(expense), getExpenseTypeName(expense))}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(expense)}</td>
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
                      {expense.status === "approved" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await markPaidMutation.mutateAsync({ expenseId: expense.id });
                            } catch (err) {
                              console.error("Failed to mark as paid:", err);
                            }
                          }}
                          title="Mark as Paid"
                          className="text-primary hover:bg-primary/10"
                          loading={markPaidMutation.isPending}
                        >
                          $
                        </Button>
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
        departmentBudget={getTargetBudget(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        isLoading={approveMutation.isPending}
      />
      <RejectModal
        isOpen={!!rejectTarget}
        expense={rejectTarget}
        departmentBudget={getTargetBudget(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
