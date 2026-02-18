"use client";

/**
 * Pending Approvals Tab
 *
 * Shows all expenses pending the current user's approval with table view,
 * search, inline approve/reject, bulk actions, budget impact, and pagination.
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
  CheckCircle,
  XCircle,
  Eye,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BarChart,
  AlertTriangle,
  TrendingUp,
} from "@/src/lib/icons";
import {
  usePendingApprovals,
  useApproveExpense,
  useRejectExpense,
  useBudgets,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import { PendingApprovalItem, Budget } from "@/src/lib/api/expenseClient";
import { getExpenseDisplayStatus } from "@/src/utils/expenseStatus";

function formatCurrencyAmount(amount: number, currency: string = "RWF") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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

      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Current: {currentUtilization.toFixed(0)}%</span>
          <span className={`font-semibold ${getStatusColor(newUtilization)}`}>
            After: {newUtilization.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
          <div
            className={`absolute h-full ${getBarColor(currentUtilization)} opacity-50`}
            style={{ width: `${Math.min(currentUtilization, 100)}%` }}
          />
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

function ApproveModal({
  isOpen,
  item,
  departmentBudget,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  item: PendingApprovalItem | null;
  departmentBudget: Budget | null;
  onClose: () => void;
  onConfirm: (comments: string) => void;
  isLoading: boolean;
}) {
  const [comments, setComments] = useState("");

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Approve Expense</h3>
        <p className="text-gray-600 mb-4">
          Approve <span className="font-medium">&quot;{item.expenseTitle}&quot;</span> for{" "}
          <span className="font-semibold text-primary">
            {formatCurrencyAmount(item.expenseAmount, item.expenseCurrency)}
          </span>
          ?
        </p>

        <BudgetImpactCard
          departmentBudget={departmentBudget}
          expenseAmount={item.expenseAmount}
          expenseCurrency={item.expenseCurrency}
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
          <Button
            variant="primary"
            onClick={() => {
              onConfirm(comments);
              setComments("");
            }}
            loading={isLoading}
          >
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  isOpen,
  item,
  departmentBudget,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  item: PendingApprovalItem | null;
  departmentBudget: Budget | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    onConfirm(reason);
    setReason("");
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-error">Reject Expense</h3>
        <p className="text-gray-600 mb-4">
          Reject <span className="font-medium">&quot;{item.expenseTitle}&quot;</span> for{" "}
          <span className="font-semibold">
            {formatCurrencyAmount(item.expenseAmount, item.expenseCurrency)}
          </span>
          ?
        </p>

        <BudgetImpactCard
          departmentBudget={departmentBudget}
          expenseAmount={item.expenseAmount}
          expenseCurrency={item.expenseCurrency}
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

interface PendingApprovalsTabProps {
  onRowClick?: (expenseId: string) => void;
  activeExpenseId?: string | null;
}

export function PendingApprovalsTab({ onRowClick, activeExpenseId }: PendingApprovalsTabProps) {
  const router = useRouter();
  const { user, selectedEntityId } = useAuth();
  const entityId = selectedEntityId || user?.entity_id || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Bulk action state
  const [bulkAction, setBulkAction] = useState<{
    type: "approve" | "reject" | null;
    isOpen: boolean;
  }>({ type: null, isOpen: false });
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  // Result modal
  const [resultModal, setResultModal] = useState<ModalState>(initialModalState);

  // Single action modal targets
  const [approveTarget, setApproveTarget] = useState<PendingApprovalItem | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingApprovalItem | null>(null);

  // Data fetching
  const { data: pendingData, isLoading: pendingLoading } = usePendingApprovals(entityId);
  const { data: budgetsData } = useBudgets();

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const pendingApprovals = useMemo(() => pendingData?.approvals || [], [pendingData?.approvals]);
  const budgets = useMemo(() => budgetsData?.budgets || [], [budgetsData?.budgets]);

  // Budget lookup
  const getDepartmentBudget = useMemo(() => {
    const budgetMap = new Map<string, Budget>();
    budgets.forEach((budget) => {
      if (!budget.categoryId) {
        budgetMap.set(budget.departmentId, budget);
      }
    });
    return (departmentId: string | undefined): Budget | null => {
      if (!departmentId) return null;
      return budgetMap.get(departmentId) || null;
    };
  }, [budgets]);

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return pendingApprovals;
    const query = searchQuery.toLowerCase();
    return pendingApprovals.filter(
      (item) =>
        item.expenseTitle.toLowerCase().includes(query) ||
        (item.submitterName || "").toLowerCase().includes(query) ||
        (item.departmentName || "").toLowerCase().includes(query)
    );
  }, [pendingApprovals, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Reset page on search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setSelectedItems(new Set());
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedItems.size === paginatedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedItems.map((item) => item.approvalId)));
    }
  };

  const toggleSelectItem = (approvalId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(approvalId)) {
      newSelected.delete(approvalId);
    } else {
      newSelected.add(approvalId);
    }
    setSelectedItems(newSelected);
  };

  const selectedApprovals = useMemo(() => {
    return paginatedItems.filter((item) => selectedItems.has(item.approvalId));
  }, [paginatedItems, selectedItems]);

  // Single approve/reject
  const handleApprove = async (comments: string) => {
    if (!approveTarget) return;
    try {
      await approveMutation.mutateAsync({ expenseId: approveTarget.expenseId, comments });
      setApproveTarget(null);
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync({ expenseId: rejectTarget.expenseId, reason });
      setRejectTarget(null);
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  // Bulk approve
  const executeBulkApprove = async () => {
    setBulkAction({ type: null, isOpen: false });
    let successCount = 0;
    let failCount = 0;

    for (const item of selectedApprovals) {
      try {
        await approveMutation.mutateAsync({ expenseId: item.expenseId, comments: "" });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSelectedItems(new Set());
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

  // Bulk reject
  const executeBulkReject = async () => {
    if (!bulkRejectReason.trim()) return;

    setBulkAction({ type: null, isOpen: false });
    let successCount = 0;
    let failCount = 0;

    for (const item of selectedApprovals) {
      try {
        await rejectMutation.mutateAsync({ expenseId: item.expenseId, reason: bulkRejectReason });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setSelectedItems(new Set());
    setBulkRejectReason("");
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

  const handleViewExpense = (expenseId: string) => {
    if (onRowClick) {
      onRowClick(expenseId);
    } else {
      router.push(`/dashboard/expenses/${expenseId}`);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  const getExpenseTypeBadge = (code: string, name: string) => {
    const variants: Record<string, "default" | "warning" | "info"> = {
      expense: "default",
      per_diem: "warning",
      advance: "info",
    };
    const variant = variants[code] || "default";
    return <Badge variant={variant}>{name || code || "Expense"}</Badge>;
  };

  const isAllSelected = paginatedItems.length > 0 && selectedItems.size === paginatedItems.length;
  const isSomeSelected = selectedItems.size > 0;

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
        message={`Are you sure you want to approve ${selectedApprovals.length} expense(s)?`}
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
              Reject {selectedApprovals.length} Expense(s)
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

      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">
          Pending Approvals ({filteredItems.length})
        </h3>
      </div>

      {/* Search and Page Size */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <Input
            placeholder="Search by title, submitter, or department..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
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
            {selectedItems.size} item(s) selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setBulkAction({ type: "approve", isOpen: true })}
              disabled={approveMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve ({selectedApprovals.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkAction({ type: "reject", isOpen: true })}
              disabled={rejectMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject ({selectedApprovals.length})
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {pendingLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {searchQuery ? "No matching approvals" : "No pending approvals"}
            </h3>
            <p className="text-text-secondary">
              {searchQuery
                ? "Try adjusting your search."
                : "You have no expenses waiting for your approval."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Step
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedItems.map((item) => (
                <tr
                  key={item.approvalId}
                  onClick={() => handleViewExpense(item.expenseId)}
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    activeExpenseId === item.expenseId
                      ? "bg-primary/5 border-l-4 border-l-primary"
                      : selectedItems.has(item.approvalId)
                        ? "bg-primary/5"
                        : ""
                  }`}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.approvalId)}
                      onChange={() => toggleSelectItem(item.approvalId)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{item.expenseTitle}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {item.submitterName || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-text-primary font-medium">
                    {formatCurrencyAmount(item.expenseAmount, item.expenseCurrency)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {formatDate(item.submittedAt || item.expenseDate)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {item.departmentName || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {getExpenseTypeBadge(item.expenseTypeCode || "", item.expenseTypeName || "")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="warning" size="sm">
                      {item.stepOrder}/{item.totalSteps}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      const { label, variant } = getExpenseDisplayStatus({
                        status: "submitted",
                        current_approval_phase: item.chain as "request" | "finance" | undefined,
                        current_step: item.stepOrder,
                        total_steps: item.totalSteps,
                      });
                      return <Badge variant={variant}>{label}</Badge>;
                    })()}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewExpense(item.expenseId)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setApproveTarget(item)}
                        title="Approve"
                        className="text-status-success hover:bg-status-success/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRejectTarget(item)}
                        title="Reject"
                        className="text-status-error hover:bg-status-error/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredItems.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length}{" "}
            approvals
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
        item={approveTarget}
        departmentBudget={getDepartmentBudget(approveTarget?.departmentId)}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        isLoading={approveMutation.isPending}
      />
      <RejectModal
        isOpen={!!rejectTarget}
        item={rejectTarget}
        departmentBudget={getDepartmentBudget(rejectTarget?.departmentId)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
