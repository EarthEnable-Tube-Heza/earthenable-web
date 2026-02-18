"use client";

/**
 * ExpenseDrawer — Orchestrator component
 *
 * Renders a single Drawer that handles all modes (create/edit/view/approve).
 * Left panel: form or detail content. Right panel: file upload or document preview.
 *
 * Toast feedback is owned by the parent (page level) via `onShowToast` so it
 * persists after the drawer closes. The drawer schedules a short delay before
 * calling `onClose` so users see the action complete before the panel slides away.
 */

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Drawer, FileUpload } from "@/src/components/ui";
import { DocumentPreview } from "@/src/components/ui/DocumentPreview";
import { DrawerHeader } from "./drawer/DrawerHeader";
import { DrawerFooter } from "./drawer/DrawerFooter";
import { DrawerCreateContent, DrawerCreateContentRef } from "./drawer/DrawerCreateContent";
import { DrawerViewContent } from "./drawer/DrawerViewContent";
import {
  useExpenseWithApprovals,
  useExpenseAttachments,
  useSubmitExpense,
  useDeleteExpense,
  useApproveExpense,
  useRejectExpense,
  useMarkExpenseAsPaid,
  useBudgets,
} from "@/src/hooks/useExpenses";
import { DrawerMode } from "@/src/hooks/useDrawerState";
import { useIsAdmin } from "@/src/lib/auth";

/** Delay (ms) between showing toast and closing drawer so users see feedback */
const CLOSE_DELAY_MS = 600;

interface ExpenseDrawerProps {
  isOpen: boolean;
  mode: DrawerMode | null;
  expenseId: string | null;
  onClose: () => void;
  onSwitchMode: (mode: DrawerMode) => void;
  /** Page-level toast — survives drawer unmount */
  onShowToast: (type: "success" | "error", message: string) => void;
}

export function ExpenseDrawer({
  isOpen,
  mode,
  expenseId,
  onClose,
  onSwitchMode,
  onShowToast,
}: ExpenseDrawerProps) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const createRef = useRef<DrawerCreateContentRef>(null);
  const [files, setFiles] = useState<File[]>([]);

  // Data for view/approve modes
  const { data: expenseData } = useExpenseWithApprovals(expenseId || "");
  const { data: attachmentsData, isLoading: isLoadingAttachments } = useExpenseAttachments(
    expenseId || ""
  );

  // Mutations for view mode actions
  const submitMutation = useSubmitExpense();
  const deleteMutation = useDeleteExpense();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const markPaidMutation = useMarkExpenseAsPaid();

  // Budget data for approve/reject budget impact
  const { data: budgetsData } = useBudgets();
  const budgets = budgetsData?.budgets || [];

  const expense = expenseData?.expense || null;
  const attachments = attachmentsData?.attachments || [];

  // Find department budget for the current expense
  const departmentBudget = (() => {
    if (!expense) return null;
    const deptId = expense.department_id;
    if (!deptId) return null;
    return budgets.find((b) => b.departmentId === deptId && !b.categoryId) || null;
  })();

  const handleClose = useCallback(() => {
    setFiles([]);
    onClose();
  }, [onClose]);

  /** Show toast first, then close drawer after a brief delay */
  const toastAndClose = useCallback(
    (type: "success" | "error", message: string) => {
      onShowToast(type, message);
      setTimeout(() => {
        handleClose();
      }, CLOSE_DELAY_MS);
    },
    [onShowToast, handleClose]
  );

  // Maximize — open full page
  const handleMaximize = () => {
    if (expenseId) {
      router.push(`/dashboard/expenses/${expenseId}`);
    }
  };

  // Copy link — no drawer close needed, just toast
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onShowToast("success", "Link copied to clipboard");
    } catch {
      onShowToast("error", "Failed to copy link");
    }
  };

  // === Create/Edit mode handlers ===
  const handleSaveDraft = () => createRef.current?.handleSave(false);
  const handleSubmitCreate = () => createRef.current?.handleSave(true);

  const handleCreateSuccess = (_expenseId: string, wasSubmitted: boolean) => {
    setFiles([]);
    // Clear auto-saved draft on success
    createRef.current?.clearDraft();
    toastAndClose(
      "success",
      wasSubmitted ? "Expense submitted for approval" : "Expense saved as draft"
    );
  };

  const handleCreateError = (message: string) => {
    onShowToast("error", message);
  };

  // === View mode handlers ===
  const handleEdit = () => {
    if (expenseId) {
      onSwitchMode("edit");
    }
  };

  const handleSubmitFromView = async () => {
    if (!expenseId) return;
    try {
      await submitMutation.mutateAsync(expenseId);
      toastAndClose("success", "Expense submitted for approval");
    } catch {
      onShowToast("error", "Failed to submit expense");
    }
  };

  const handleDelete = async () => {
    if (!expenseId) return;
    try {
      await deleteMutation.mutateAsync(expenseId);
      toastAndClose("success", "Expense deleted");
    } catch {
      onShowToast("error", "Failed to delete expense");
    }
  };

  // === Approve/Reject handlers ===
  const handleApprove = async (comments: string) => {
    if (!expenseId) return;
    try {
      await approveMutation.mutateAsync({ expenseId, comments });
      toastAndClose("success", "Expense approved");
    } catch {
      onShowToast("error", "Failed to approve expense");
    }
  };

  const handleReject = async (reason: string) => {
    if (!expenseId) return;
    try {
      await rejectMutation.mutateAsync({ expenseId, reason });
      toastAndClose("success", "Expense rejected");
    } catch {
      onShowToast("error", "Failed to reject expense");
    }
  };

  const handleMarkPaid = async (data: import("@/src/lib/api/expenseClient").MarkPaidData) => {
    if (!expenseId) return;
    try {
      await markPaidMutation.mutateAsync({ expenseId, ...data });
      toastAndClose("success", "Expense marked as paid");
    } catch {
      onShowToast("error", "Failed to mark as paid");
    }
  };

  if (!mode) return null;

  const isCreateOrEdit = mode === "create" || mode === "edit";

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} size="lg" preventOverlayClose={isCreateOrEdit}>
      <DrawerHeader
        mode={mode}
        expenseId={expenseId}
        onClose={handleClose}
        onMaximize={expenseId ? handleMaximize : undefined}
        onCopyLink={expenseId ? handleCopyLink : undefined}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content (~60%) */}
        <div className="flex-1 overflow-y-auto p-6">
          {isCreateOrEdit && (
            <DrawerCreateContent
              ref={createRef}
              expenseId={mode === "edit" ? expenseId : null}
              files={files}
              onSuccess={handleCreateSuccess}
              onError={handleCreateError}
            />
          )}
          {(mode === "view" || mode === "approve") && expenseId && (
            <DrawerViewContent expenseId={expenseId} />
          )}
        </div>

        {/* Right: Documents (~40%) */}
        <div className="w-[40%] max-lg:hidden border-l overflow-y-auto bg-gray-50">
          {isCreateOrEdit ? (
            <div className="p-4">
              <FileUpload
                label="Supporting Documents"
                required={createRef.current?.categoryRequiresReceipt}
                files={files}
                onFilesChange={setFiles}
                accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf,image/heic,image/heif"
                maxSize={10 * 1024 * 1024}
                maxFiles={5}
                error={createRef.current?.attachmentError}
              />
            </div>
          ) : (
            <DocumentPreview attachments={attachments} isLoading={isLoadingAttachments} />
          )}
        </div>
      </div>

      {/* Mobile: Documents below content */}
      <div className="lg:hidden border-t">
        {isCreateOrEdit ? (
          <div className="p-4">
            <FileUpload
              label="Supporting Documents"
              required={createRef.current?.categoryRequiresReceipt}
              files={files}
              onFilesChange={setFiles}
              accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf,image/heic,image/heif"
              maxSize={10 * 1024 * 1024}
              maxFiles={5}
              error={createRef.current?.attachmentError}
            />
          </div>
        ) : attachments.length > 0 ? (
          <div className="p-4 max-h-[200px] overflow-y-auto">
            <DocumentPreview attachments={attachments} isLoading={isLoadingAttachments} />
          </div>
        ) : null}
      </div>

      <DrawerFooter
        mode={mode}
        expense={expense}
        departmentBudget={departmentBudget}
        canApprove={expenseData?.canApprove}
        canReject={expenseData?.canReject}
        onSaveDraft={handleSaveDraft}
        onSubmit={isCreateOrEdit ? handleSubmitCreate : handleSubmitFromView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkPaid={isAdmin ? handleMarkPaid : undefined}
        isSaving={createRef.current?.isSaving}
        isSubmitting={createRef.current?.isSubmitting || submitMutation.isPending}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
        isDeleting={deleteMutation.isPending}
        isMarkingPaid={markPaidMutation.isPending}
      />
    </Drawer>
  );
}
