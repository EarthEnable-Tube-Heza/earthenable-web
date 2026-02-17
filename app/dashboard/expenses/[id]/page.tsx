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
  Paperclip,
  CreditCard,
  Wallet,
} from "lucide-react";

import { Button, Card, Badge, Spinner, DocumentPreview } from "@/src/components/ui";
import {
  useExpenseWithApprovals,
  useExpenseAttachments,
  useApproveExpense,
  useRejectExpense,
  useMarkExpenseAsPaid,
  usePostToQuickBooks,
  usePaymentAccounts,
  useQuickBooksChartOfAccounts,
} from "@/src/hooks/useExpenses";
import { ApprovalStep } from "@/src/lib/api/expenseClient";
import { getExpenseDisplayStatus } from "@/src/utils/expenseStatus";

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
          {step.chain && (
            <Badge variant={step.chain === "finance" ? "info" : "default"} size="sm">
              {step.chain.toUpperCase()}
            </Badge>
          )}
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
  const { data: attachmentsData, isLoading: isLoadingAttachments } =
    useExpenseAttachments(expenseId);
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const markPaidMutation = useMarkExpenseAsPaid();
  const postToQBMutation = usePostToQuickBooks();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entityId = data?.expense?.entity_id || (data?.expense as any)?.entityId;
  const { data: paymentAccountsData } = usePaymentAccounts(entityId);
  const { data: qbAccountsData } = useQuickBooksChartOfAccounts(entityId);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [selectedQBAccountId, setSelectedQBAccountId] = useState("");
  const [selectedQBAccountName, setSelectedQBAccountName] = useState("");
  const [qbAccountSearch, setQbAccountSearch] = useState("");
  const [actionResult, setActionResult] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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

  const handleMarkPaid = async () => {
    setActionResult(null);
    try {
      await markPaidMutation.mutateAsync({
        expenseId,
        referenceNumber: referenceNumber || undefined,
        batchNumber: batchNumber || undefined,
        paymentAccountId: paymentAccountId || undefined,
        quickbooksExpenseAccountId: selectedQBAccountId || undefined,
        quickbooksExpenseAccountName: selectedQBAccountName || undefined,
        paymentDate: paymentDate || undefined,
      });
      setShowMarkPaidModal(false);
      setReferenceNumber("");
      setBatchNumber("");
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setPaymentAccountId("");
      setSelectedQBAccountId("");
      setSelectedQBAccountName("");
      setActionResult({ type: "success", text: "Expense marked as paid" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to mark as paid";
      setActionResult({ type: "error", text: message });
    }
  };

  const handlePostToQuickBooks = async () => {
    setActionResult(null);
    try {
      await postToQBMutation.mutateAsync({ expenseId });
      setActionResult({ type: "success", text: "Expense posted to QuickBooks successfully" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post to QuickBooks";
      setActionResult({ type: "error", text: message });
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
          {expense.status === "approved" && (
            <Button variant="primary" onClick={() => setShowMarkPaidModal(true)}>
              <DollarSign className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          {expense.status === "paid" &&
            !expense.quickbooks_journal_id &&
            !expense.quickbooksJournalId && (
              <Button
                variant="outline"
                onClick={handlePostToQuickBooks}
                loading={postToQBMutation.isPending}
              >
                Post to QuickBooks
              </Button>
            )}
        </div>
      </div>

      {/* Action result message */}
      {actionResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            actionResult.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          }`}
        >
          {actionResult.text}
        </div>
      )}

      {/* Expense summary card */}
      <Card variant="elevated" className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{expense.title}</h1>
            {(() => {
              const { label, variant } = getExpenseDisplayStatus(expense);
              return (
                <Badge variant={variant} size="lg">
                  {label}
                </Badge>
              );
            })()}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            <p className="text-sm text-gray-500">
              {expense.expense_type_name || expense.expenseTypeName || "-"}
            </p>
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

        {/* Payment Details */}
        {(expense.account_name ||
          expense.accountName ||
          expense.account_number ||
          expense.accountNumber ||
          expense.bank_name ||
          expense.bankName) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Payment Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(expense.account_name || expense.accountName) && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Account Holder</p>
                    <p className="text-sm font-medium">
                      {expense.account_name || expense.accountName}
                    </p>
                  </div>
                </div>
              )}
              {(expense.bank_name || expense.bankName) && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Bank / Provider</p>
                    <p className="text-sm font-medium">{expense.bank_name || expense.bankName}</p>
                  </div>
                </div>
              )}
              {(expense.account_number || expense.accountNumber) && (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="text-sm font-medium font-mono">
                      {expense.account_number || expense.accountNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Approval chain - grouped by chain type */}
      {approvals &&
        approvals.length > 0 &&
        (() => {
          const requestSteps = approvals.filter((a) => !a.chain || a.chain === "request");
          const financeSteps = approvals.filter((a) => a.chain === "finance");
          const hasFinanceChain = financeSteps.length > 0;

          return (
            <Card variant="bordered" className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Approval Progress ({approvals.filter((a) => a.status === "approved").length}/
                {totalSteps} approved)
              </h2>

              {/* Request Chain */}
              {requestSteps.length > 0 && (
                <div className="mb-6">
                  {hasFinanceChain && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="default" size="sm">
                        REQUEST CHAIN
                      </Badge>
                      <div className="flex-1 border-b border-gray-200" />
                    </div>
                  )}
                  <div className="mt-2">
                    {requestSteps.map((step, index) => (
                      <ApprovalStepItem
                        key={step.id}
                        step={step}
                        isCurrentStep={step.stepOrder === currentStep}
                        index={index}
                        total={requestSteps.length}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Finance Chain */}
              {financeSteps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="info" size="sm">
                      FINANCE CHAIN
                    </Badge>
                    <div className="flex-1 border-b border-blue-200" />
                  </div>
                  <div className="mt-2">
                    {financeSteps.map((step, index) => (
                      <ApprovalStepItem
                        key={step.id}
                        step={step}
                        isCurrentStep={step.stepOrder === currentStep}
                        index={index}
                        total={financeSteps.length}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })()}

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

      {/* Attachments / Document Preview */}
      {/* Attachments / Document Preview */}
      {(isLoadingAttachments || (attachmentsData && attachmentsData.attachments.length > 0)) && (
        <Card variant="bordered" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-400" />
              <h2 className="text-lg font-semibold">
                Attachments{attachmentsData ? ` (${attachmentsData.attachments.length})` : ""}
              </h2>
            </div>
          </div>
          <div className="h-[500px]">
            <DocumentPreview
              attachments={attachmentsData?.attachments || []}
              isLoading={isLoadingAttachments}
            />
          </div>
        </Card>
      )}

      {/* QuickBooks Status (for paid expenses) */}
      {expense.status === "paid" &&
        (expense.quickbooks_journal_id || expense.quickbooksJournalId) && (
          <Card variant="bordered" className="p-6">
            <h2 className="text-lg font-semibold mb-3">QuickBooks</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Status</span>
                <Badge variant="success" size="sm">
                  Posted
                </Badge>
              </div>
              <div>
                <span className="text-gray-500 block">Journal ID</span>
                <span className="font-medium">
                  {expense.quickbooks_journal_id || expense.quickbooksJournalId}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Posted At</span>
                <span className="font-medium">
                  {expense.quickbooks_posted_at || expense.quickbooksPostedAt
                    ? new Date(
                        expense.quickbooks_posted_at || expense.quickbooksPostedAt || ""
                      ).toLocaleString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </Card>
        )}

      {/* Finance Processing Details (for paid expenses) */}
      {expense.status === "paid" &&
        (expense.batchNumber ||
          expense.batch_number ||
          expense.paymentAccountName ||
          expense.payment_account_name ||
          expense.quickbooksExpenseAccountName ||
          expense.quickbooks_expense_account_name ||
          expense.paymentDate ||
          expense.payment_date ||
          expense.referenceNumber ||
          expense.reference_number) && (
          <Card variant="bordered" className="p-6">
            <h2 className="text-lg font-semibold mb-3">Finance Processing Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {(expense.batchNumber || expense.batch_number) && (
                <div>
                  <span className="text-gray-500 block">Batch Number</span>
                  <span className="font-medium">{expense.batchNumber || expense.batch_number}</span>
                </div>
              )}
              {(expense.paymentAccountName || expense.payment_account_name) && (
                <div>
                  <span className="text-gray-500 block">Source Payment Account</span>
                  <span className="font-medium">
                    {expense.paymentAccountName || expense.payment_account_name}
                  </span>
                </div>
              )}
              {(expense.quickbooksExpenseAccountName ||
                expense.quickbooks_expense_account_name) && (
                <div>
                  <span className="text-gray-500 block">Expense Account (QB)</span>
                  <span className="font-medium">
                    {expense.quickbooksExpenseAccountName ||
                      expense.quickbooks_expense_account_name}
                  </span>
                </div>
              )}
              {(expense.paymentDate || expense.payment_date) && (
                <div>
                  <span className="text-gray-500 block">Payment Date</span>
                  <span className="font-medium">
                    {new Date(
                      expense.paymentDate || expense.payment_date || ""
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              {(expense.referenceNumber || expense.reference_number) && (
                <div>
                  <span className="text-gray-500 block">Reference Number</span>
                  <span className="font-medium">
                    {expense.referenceNumber || expense.reference_number}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-500 block">Posted to QuickBooks</span>
                {expense.quickbooks_journal_id || expense.quickbooksJournalId ? (
                  <Badge variant="success" size="sm">
                    Yes (
                    {expense.quickbooks_posted_at || expense.quickbooksPostedAt
                      ? new Date(
                          expense.quickbooks_posted_at || expense.quickbooksPostedAt || ""
                        ).toLocaleDateString()
                      : ""}
                    )
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    No
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        )}

      {/* QB Error Display */}
      {expense.status === "paid" &&
        (expense.quickbooks_error || expense.quickbooksError) &&
        !(expense.quickbooks_journal_id || expense.quickbooksJournalId) && (
          <Card variant="bordered" className="p-6 border-error/30">
            <h2 className="text-lg font-semibold mb-2 text-error">QuickBooks Posting Error</h2>
            <p className="text-sm text-gray-600">
              {expense.quickbooks_error || expense.quickbooksError}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handlePostToQuickBooks}
              loading={postToQBMutation.isPending}
            >
              Retry Post to QuickBooks
            </Button>
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

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Mark as Paid</h3>
            <p className="text-gray-600 mb-4">
              Confirm that this expense of{" "}
              <strong>{formatCurrency(expense.amount, expense.currency)}</strong> has been paid.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. REF-123456"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. BATCH-2026-001"
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm"
                />
              </div>
              {paymentAccountsData && paymentAccountsData.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Payment Account
                  </label>
                  <select
                    value={paymentAccountId}
                    onChange={(e) => setPaymentAccountId(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm"
                  >
                    <option value="">Select account...</option>
                    {paymentAccountsData.map((acct) => (
                      <option key={acct.id} value={acct.id}>
                        {acct.name}
                        {acct.bank_name ? ` (${acct.bank_name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {qbAccountsData && qbAccountsData.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Account (QuickBooks)
                  </label>
                  <input
                    type="text"
                    value={qbAccountSearch}
                    onChange={(e) => setQbAccountSearch(e.target.value)}
                    placeholder="Search QB accounts..."
                    className="w-full border rounded-lg p-2.5 text-sm mb-1"
                  />
                  <select
                    value={selectedQBAccountId}
                    onChange={(e) => {
                      const acct = qbAccountsData.find((a) => a.id === e.target.value);
                      setSelectedQBAccountId(e.target.value);
                      setSelectedQBAccountName(acct?.fully_qualified_name || acct?.name || "");
                    }}
                    className="w-full border rounded-lg p-2.5 text-sm"
                    size={Math.min(
                      6,
                      (qbAccountsData.filter(
                        (a) =>
                          (!qbAccountSearch ||
                            a.name.toLowerCase().includes(qbAccountSearch.toLowerCase()) ||
                            (a.fully_qualified_name || "")
                              .toLowerCase()
                              .includes(qbAccountSearch.toLowerCase()) ||
                            (a.account_number || "").includes(qbAccountSearch)) &&
                          a.classification === "Expense"
                      ).length || 1) + 1
                    )}
                  >
                    <option value="">Select expense account...</option>
                    {qbAccountsData
                      .filter(
                        (a) =>
                          (!qbAccountSearch ||
                            a.name.toLowerCase().includes(qbAccountSearch.toLowerCase()) ||
                            (a.fully_qualified_name || "")
                              .toLowerCase()
                              .includes(qbAccountSearch.toLowerCase()) ||
                            (a.account_number || "").includes(qbAccountSearch)) &&
                          a.classification === "Expense"
                      )
                      .map((acct) => (
                        <option key={acct.id} value={acct.id}>
                          {acct.account_number ? `${acct.account_number} - ` : ""}
                          {acct.fully_qualified_name || acct.name}
                        </option>
                      ))}
                  </select>
                  {selectedQBAccountName && (
                    <p className="text-xs text-gray-500 mt-1">Selected: {selectedQBAccountName}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMarkPaidModal(false);
                  setReferenceNumber("");
                  setBatchNumber("");
                  setPaymentDate(new Date().toISOString().split("T")[0]);
                  setPaymentAccountId("");
                  setSelectedQBAccountId("");
                  setSelectedQBAccountName("");
                  setQbAccountSearch("");
                }}
                disabled={markPaidMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleMarkPaid}
                loading={markPaidMutation.isPending}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
