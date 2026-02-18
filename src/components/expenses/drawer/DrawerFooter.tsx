"use client";

/**
 * DrawerFooter — Sticky footer with mode-appropriate action buttons.
 *
 * Approve/reject flows show an inline confirmation panel with budget impact
 * and comments (optional for approve, required for reject).
 */

import { useState } from "react";
import { Button, Textarea } from "@/src/components/ui";
import { DrawerMode } from "@/src/hooks/useDrawerState";
import {
  Save,
  Check,
  Edit,
  Trash2,
  Send,
  XCircle,
  DollarSign,
  BarChart,
  AlertTriangle,
  TrendingUp,
} from "@/src/lib/icons";
import { Expense, MarkPaidData, Budget } from "@/src/lib/api/expenseClient";

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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
        <p className="text-xs text-gray-500 text-center">
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
      className={`rounded-lg p-3 mb-3 border ${
        willExceedBudget
          ? "bg-red-50 border-red-200"
          : willBeAtRisk
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {willExceedBudget ? (
          <TrendingUp className="w-4 h-4 text-status-error" />
        ) : willBeAtRisk ? (
          <AlertTriangle className="w-4 h-4 text-status-warning" />
        ) : (
          <BarChart className="w-4 h-4 text-status-success" />
        )}
        <span className="font-semibold text-xs">
          {departmentBudget.departmentName} Budget Impact
        </span>
      </div>

      {willExceedBudget && (
        <div className="bg-red-100 text-red-800 text-xs p-1.5 rounded mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Will exceed budget by{" "}
            <strong>{formatCurrencyAmount(Math.abs(newRemaining), expenseCurrency)}</strong>
          </span>
        </div>
      )}

      {willBeAtRisk && !willExceedBudget && (
        <div className="bg-yellow-100 text-yellow-800 text-xs p-1.5 rounded mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Budget will be at risk ({newUtilization.toFixed(0)}% utilized)</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div>
          <span className="text-gray-500">Budget:</span>
          <span className="ml-1 font-medium">
            {formatCurrencyAmount(departmentBudget.allocatedAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Spent:</span>
          <span className="ml-1 font-medium">
            {formatCurrencyAmount(departmentBudget.spentAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">This expense:</span>
          <span className="ml-1 font-medium text-primary">
            +{formatCurrencyAmount(expenseAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">After:</span>
          <span className={`ml-1 font-medium ${getStatusColor(newUtilization)}`}>
            {formatCurrencyAmount(newSpent, expenseCurrency)}
          </span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[10px] mb-0.5">
          <span className="text-gray-500">Current: {currentUtilization.toFixed(0)}%</span>
          <span className={`font-semibold ${getStatusColor(newUtilization)}`}>
            After: {newUtilization.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden relative">
          <div
            className={`absolute h-full ${getBarColor(currentUtilization)} opacity-50`}
            style={{ width: `${Math.min(currentUtilization, 100)}%` }}
          />
          <div
            className={`absolute h-full ${getBarColor(newUtilization)}`}
            style={{ width: `${Math.min(newUtilization, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface DrawerFooterProps {
  mode: DrawerMode;
  expense?: Expense | null;
  departmentBudget?: Budget | null;
  canApprove?: boolean;
  canReject?: boolean;
  // Create/edit actions
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  // View actions
  onEdit?: () => void;
  onDelete?: () => void;
  // Approve/reject actions
  onApprove?: (comments: string) => void;
  onReject?: (reason: string) => void;
  // Mark as paid
  onMarkPaid?: (data: MarkPaidData) => void;
  // Loading states
  isSaving?: boolean;
  isSubmitting?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
  isDeleting?: boolean;
  isMarkingPaid?: boolean;
}

export function DrawerFooter({
  mode,
  expense,
  departmentBudget,
  canApprove,
  canReject,
  onSaveDraft,
  onSubmit,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onMarkPaid,
  isSaving,
  isSubmitting,
  isApproving,
  isRejecting,
  isDeleting,
  isMarkingPaid,
}: DrawerFooterProps) {
  // "idle" = showing Approve/Reject buttons
  // "approve" = showing approve confirmation with budget + comments
  // "reject" = showing reject confirmation with budget + reason
  const [actionMode, setActionMode] = useState<"idle" | "approve" | "reject">("idle");
  const [approveComments, setApproveComments] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const resetActionMode = () => {
    setActionMode("idle");
    setApproveComments("");
    setRejectReason("");
    setRejectError("");
  };

  const handleConfirmApprove = () => {
    onApprove?.(approveComments);
    resetActionMode();
  };

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      setRejectError("Rejection reason is required");
      return;
    }
    onReject?.(rejectReason);
    resetActionMode();
  };

  const handleMarkPaid = () => {
    onMarkPaid?.({ referenceNumber: referenceNumber || undefined });
    setShowMarkPaid(false);
    setReferenceNumber("");
  };

  const isAnyLoading =
    isSaving || isSubmitting || isApproving || isRejecting || isDeleting || isMarkingPaid;

  const showApproveReject = (mode === "view" || mode === "approve") && canApprove;

  return (
    <div className="border-t border-gray-200 bg-white shrink-0">
      {/* Approve confirmation panel */}
      {showApproveReject && actionMode === "approve" && expense && (
        <div className="px-6 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-status-success" />
            <span className="text-sm font-semibold">Approve Expense</span>
          </div>
          <p className="text-xs text-gray-600">
            Approve <span className="font-medium">&quot;{expense.title}&quot;</span> for{" "}
            <span className="font-semibold text-primary">
              {formatCurrencyAmount(expense.amount, expense.currency)}
            </span>
            ?
          </p>
          <BudgetImpactCard
            departmentBudget={departmentBudget || null}
            expenseAmount={expense.amount}
            expenseCurrency={expense.currency}
          />
          <Textarea
            value={approveComments}
            onChange={(e) => setApproveComments(e.target.value)}
            placeholder="Add comments (optional)"
            rows={2}
          />
        </div>
      )}

      {/* Reject confirmation panel */}
      {showApproveReject && actionMode === "reject" && expense && (
        <div className="px-6 pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-status-error" />
            <span className="text-sm font-semibold text-status-error">Reject Expense</span>
          </div>
          <p className="text-xs text-gray-600">
            Reject <span className="font-medium">&quot;{expense.title}&quot;</span> for{" "}
            <span className="font-semibold">
              {formatCurrencyAmount(expense.amount, expense.currency)}
            </span>
            ?
          </p>
          <BudgetImpactCard
            departmentBudget={departmentBudget || null}
            expenseAmount={expense.amount}
            expenseCurrency={expense.currency}
          />
          <Textarea
            value={rejectReason}
            onChange={(e) => {
              setRejectReason(e.target.value);
              setRejectError("");
            }}
            placeholder="Rejection reason (required)"
            rows={2}
            error={rejectError || undefined}
          />
        </div>
      )}

      {/* Inline mark as paid */}
      {showMarkPaid && (
        <div className="px-6 pt-4">
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Payment reference number (optional)"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="px-6 py-4 flex gap-3 justify-start">
        {/* Create mode */}
        {(mode === "create" || mode === "edit") && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              loading={isSaving}
              disabled={isAnyLoading}
            >
              <Save className="w-4 h-4 mr-1" />
              Save as Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmit}
              loading={isSubmitting}
              disabled={isAnyLoading}
            >
              <Check className="w-4 h-4 mr-1" />
              Submit for Approval
            </Button>
          </>
        )}

        {/* View mode — own draft */}
        {mode === "view" && expense?.status === "draft" && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit} disabled={isAnyLoading}>
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSubmit}
              loading={isSubmitting}
              disabled={isAnyLoading}
            >
              <Send className="w-4 h-4 mr-1" />
              Submit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              loading={isDeleting}
              disabled={isAnyLoading}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        {/* View/approve mode — approvable */}
        {showApproveReject && (
          <>
            {actionMode === "approve" && (
              <>
                <Button variant="ghost" size="sm" onClick={resetActionMode} disabled={isAnyLoading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmApprove}
                  loading={isApproving}
                  disabled={isAnyLoading}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Confirm Approve
                </Button>
              </>
            )}
            {actionMode === "reject" && (
              <>
                <Button variant="ghost" size="sm" onClick={resetActionMode} disabled={isAnyLoading}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleConfirmReject}
                  loading={isRejecting}
                  disabled={isAnyLoading}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Confirm Reject
                </Button>
              </>
            )}
            {actionMode === "idle" && (
              <>
                {canReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionMode("reject")}
                    disabled={isAnyLoading}
                    className="text-status-error border-status-error hover:bg-status-error/10"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActionMode("approve")}
                  disabled={isAnyLoading}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </>
        )}

        {/* View mode — approved, admin can mark paid */}
        {mode === "view" && expense?.status === "approved" && onMarkPaid && (
          <>
            {showMarkPaid ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowMarkPaid(false);
                    setReferenceNumber("");
                  }}
                  disabled={isAnyLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkPaid}
                  loading={isMarkingPaid}
                  disabled={isAnyLoading}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Confirm Payment
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowMarkPaid(true)}
                disabled={isAnyLoading}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Mark as Paid
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
