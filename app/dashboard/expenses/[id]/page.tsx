"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  FileText,
  User,
  Building,
  Calendar,
  DollarSign,
} from "lucide-react";

import { Button, Card, Badge, Spinner } from "@/src/components/ui";
import {
  useExpenseWithApprovals,
  useApproveExpense,
  useRejectExpense,
} from "@/src/hooks/useExpenses";
import { ApprovalStep } from "@/src/lib/api/expenseClient";

// Approval confirmation modal
function ApproveModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comments: string) => void;
  isLoading: boolean;
}) {
  const [comments, setComments] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Approve Expense</h3>
        <p className="text-gray-600 mb-4">Are you sure you want to approve this expense?</p>
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

// Rejection modal with required reason
function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
        <h3 className="text-lg font-semibold mb-4 text-error">Reject Expense</h3>
        <p className="text-gray-600 mb-4">Please provide a reason for rejecting this expense.</p>
        <textarea
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          placeholder="Rejection reason (required)"
          className={`w-full border rounded-lg p-3 mb-2 h-24 resize-none ${
            error ? "border-error" : ""
          }`}
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

// Approval step component
function ApprovalStepItem({
  step,
  isCurrentStep,
  index,
  total,
}: {
  step: ApprovalStep;
  isCurrentStep: boolean;
  index: number;
  total: number;
}) {
  const getStatusIcon = () => {
    switch (step.status) {
      case "approved":
        return <Check className="w-4 h-4 text-white" />;
      case "rejected":
        return <X className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-white" />;
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case "approved":
        return "bg-success";
      case "rejected":
        return "bg-error";
      default:
        return isCurrentStep ? "bg-primary" : "bg-gray-300";
    }
  };

  return (
    <div className="flex items-start gap-4">
      {/* Step indicator */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor()}`}
        >
          {getStatusIcon()}
        </div>
        {index < total - 1 && (
          <div
            className={`w-0.5 h-12 ${step.status === "approved" ? "bg-success" : "bg-gray-200"}`}
          />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">Step {step.stepOrder}</span>
          <Badge
            variant={
              step.status === "approved"
                ? "success"
                : step.status === "rejected"
                  ? "error"
                  : "warning"
            }
            size="sm"
          >
            {step.status}
          </Badge>
          {isCurrentStep && step.status === "pending" && (
            <Badge variant="info" size="sm">
              Current
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {step.approverName || "Unknown"}
          {step.approverRole && <span className="text-gray-400"> ({step.approverRole})</span>}
        </p>
        {step.comments && (
          <p className="text-sm text-gray-500 mt-1 italic">&quot;{step.comments}&quot;</p>
        )}
        {step.approvedAt && (
          <p className="text-xs text-gray-400 mt-1">{new Date(step.approvedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;

  const { data, isLoading, error } = useExpenseWithApprovals(expenseId);
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async (comments: string) => {
    try {
      await approveMutation.mutateAsync({ expenseId, comments });
      setShowApproveModal(false);
    } catch (err) {
      console.error("Failed to approve:", err);
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectMutation.mutateAsync({ expenseId, reason });
      setShowRejectModal(false);
    } catch (err) {
      console.error("Failed to reject:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Card variant="bordered" className="p-6 text-center">
          <p className="text-error mb-4">Failed to load expense details</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const {
    expense,
    approvals,
    currentStep,
    totalSteps,
    canApprove,
    canReject,
    submitterName,
    departmentName,
    categoryName,
  } = data;

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "submitted":
        return "warning";
      case "paid":
        return "info";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper to safely format date (handles both expense_date and expenseDate due to backend alias)
  const formatExpenseDate = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateValue = expense.expense_date || (expense as any).expenseDate;
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {(canApprove || canReject) && (
          <div className="flex gap-3">
            {canReject && (
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                className="text-error border-error hover:bg-error/10"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            )}
            {canApprove && (
              <Button variant="primary" onClick={() => setShowApproveModal(true)}>
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Expense summary card */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{expense.title}</h1>
            <Badge variant={getStatusVariant(expense.status)} size="lg">
              {expense.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            <p className="text-sm text-gray-500">{expense.expense_type}</p>
          </div>
        </div>

        {expense.description && <p className="text-gray-600 mb-6">{expense.description}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Submitter</p>
              <p className="text-sm font-medium">{submitterName || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="text-sm font-medium">{departmentName || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium">{categoryName || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Expense Date</p>
              <p className="text-sm font-medium">{formatExpenseDate()}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Approval chain */}
      {approvals && approvals.length > 0 && (
        <Card variant="bordered" className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Approval Progress ({approvals.filter((a) => a.status === "approved").length}/
            {totalSteps} approved)
          </h2>
          <div className="mt-4">
            {approvals.map((step, index) => (
              <ApprovalStepItem
                key={step.id}
                step={step}
                isCurrentStep={step.stepOrder === currentStep}
                index={index}
                total={approvals.length}
              />
            ))}
          </div>
        </Card>
      )}

      {/* No approval chain for drafts */}
      {(!approvals || approvals.length === 0) && expense.status === "draft" && (
        <Card variant="bordered" className="p-6 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600">Draft Expense</h3>
          <p className="text-gray-500 mt-1">
            This expense has not been submitted for approval yet.
          </p>
        </Card>
      )}

      {/* Modals */}
      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        isLoading={approveMutation.isPending}
      />
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </div>
  );
}
