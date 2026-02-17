/**
 * Expense Display Status Utility
 *
 * Single source of truth for computing human-readable expense status labels
 * from the raw status + approval phase + step progress info.
 *
 * The raw `status` enum (draft, submitted, approved, rejected, paid) is the
 * state machine used for DB queries, filters, and indexes — it must NOT change.
 * This utility is purely a display layer concern.
 */

export type BadgeVariant = "default" | "warning" | "success" | "error" | "info";

export interface ExpenseDisplayStatus {
  label: string;
  variant: BadgeVariant;
}

export function getExpenseDisplayStatus(expense: {
  status: string;
  current_approval_phase?: string;
  currentApprovalPhase?: string;
  current_step?: number;
  currentStep?: number;
  total_steps?: number;
  totalSteps?: number;
}): ExpenseDisplayStatus {
  const phase = expense.current_approval_phase || expense.currentApprovalPhase;
  const currentStep = expense.current_step ?? expense.currentStep;
  const totalSteps = expense.total_steps ?? expense.totalSteps;

  switch (expense.status) {
    case "draft":
      return { label: "Draft", variant: "default" };
    case "submitted": {
      const fraction =
        totalSteps && totalSteps > 1 && currentStep ? ` (${currentStep}/${totalSteps})` : "";
      if (phase === "finance") return { label: `Finance Review${fraction}`, variant: "info" };
      return { label: `Pending Approval${fraction}`, variant: "warning" };
    }
    case "approved":
      return { label: "Approved", variant: "success" };
    case "rejected":
      return { label: "Rejected", variant: "error" };
    case "paid":
      return { label: "Paid", variant: "info" };
    default:
      return { label: expense.status, variant: "default" };
  }
}
