"use client";

/**
 * DrawerViewContent — View/approve detail extracted from [id]/page.tsx
 */

import { Badge, Spinner } from "@/src/components/ui";
import { getExpenseDisplayStatus } from "@/src/utils/expenseStatus";
import { useExpenseWithApprovals, useBudgets } from "@/src/hooks/useExpenses";
import {
  User,
  Building,
  FileText,
  Calendar,
  DollarSign,
  CreditCard,
  Wallet,
} from "@/src/lib/icons";
import { ApprovalTimeline } from "./ApprovalTimeline";
import { BudgetImpactPanel } from "./BudgetImpactPanel";
import { Budget } from "@/src/lib/api/expenseClient";
import { useMemo } from "react";

interface DrawerViewContentProps {
  expenseId: string;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "RWF",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function DrawerViewContent({ expenseId }: DrawerViewContentProps) {
  const { data, isLoading, error } = useExpenseWithApprovals(expenseId);
  const { data: budgetsData } = useBudgets();

  const budgets = useMemo(() => budgetsData?.budgets || [], [budgetsData?.budgets]);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-status-error text-sm">Failed to load expense details</p>
      </div>
    );
  }

  const {
    expense,
    approvals,
    currentStep,
    totalSteps,
    submitterName,
    departmentName,
    categoryName,
  } = data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dateValue = expense.expense_date || (expense as any).expenseDate;
  const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString() : "N/A";

  const departmentBudget = getDepartmentBudget(expense.department_id);

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">{expense.title}</h3>
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
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(expense.amount, expense.currency)}
            </p>
            <p className="text-sm text-text-tertiary">
              {expense.expense_type_name || expense.expenseTypeName || "-"}
            </p>
          </div>
        </div>

        {expense.description && (
          <p className="text-sm text-text-secondary mb-4">{expense.description}</p>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Submitter</p>
              <p className="text-sm font-medium">{submitterName || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Department</p>
              <p className="text-sm font-medium">{departmentName || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Category</p>
              <p className="text-sm font-medium">{categoryName || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-text-tertiary" />
            <div>
              <p className="text-xs text-text-tertiary">Expense Date</p>
              <p className="text-sm font-medium">{formattedDate}</p>
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
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-3">
              Payment Details
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {(expense.account_name || expense.accountName) && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-xs text-text-tertiary">Account Holder</p>
                    <p className="text-sm font-medium">
                      {expense.account_name || expense.accountName}
                    </p>
                  </div>
                </div>
              )}
              {(expense.bank_name || expense.bankName) && (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-xs text-text-tertiary">Bank / Provider</p>
                    <p className="text-sm font-medium">{expense.bank_name || expense.bankName}</p>
                  </div>
                </div>
              )}
              {(expense.account_number || expense.accountNumber) && (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-text-tertiary" />
                  <div>
                    <p className="text-xs text-text-tertiary">Account Number</p>
                    <p className="text-sm font-medium font-mono">
                      {expense.account_number || expense.accountNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Budget Impact (for submitted expenses) */}
      {expense.status === "submitted" && departmentBudget && (
        <BudgetImpactPanel
          departmentBudget={departmentBudget}
          expenseAmount={expense.amount}
          expenseCurrency={expense.currency}
        />
      )}

      {/* Approval Timeline */}
      {approvals && approvals.length > 0 && (
        <ApprovalTimeline approvals={approvals} currentStep={currentStep} totalSteps={totalSteps} />
      )}

      {/* Draft placeholder */}
      {(!approvals || approvals.length === 0) && expense.status === "draft" && (
        <div className="text-center py-8">
          <DollarSign className="w-10 h-10 text-text-tertiary mx-auto mb-2" />
          <p className="text-sm text-text-secondary">
            This expense has not been submitted for approval yet.
          </p>
        </div>
      )}

      {/* Finance Processing Details */}
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
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Finance Processing</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {(expense.batchNumber || expense.batch_number) && (
                <div>
                  <span className="text-text-tertiary block">Batch Number</span>
                  <span className="font-medium">{expense.batchNumber || expense.batch_number}</span>
                </div>
              )}
              {(expense.paymentAccountName || expense.payment_account_name) && (
                <div>
                  <span className="text-text-tertiary block">Source Account</span>
                  <span className="font-medium">
                    {expense.paymentAccountName || expense.payment_account_name}
                  </span>
                </div>
              )}
              {(expense.quickbooksExpenseAccountName ||
                expense.quickbooks_expense_account_name) && (
                <div>
                  <span className="text-text-tertiary block">Expense Account (QB)</span>
                  <span className="font-medium">
                    {expense.quickbooksExpenseAccountName ||
                      expense.quickbooks_expense_account_name}
                  </span>
                </div>
              )}
              {(expense.paymentDate || expense.payment_date) && (
                <div>
                  <span className="text-text-tertiary block">Payment Date</span>
                  <span className="font-medium">
                    {new Date(
                      expense.paymentDate || expense.payment_date || ""
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              {(expense.referenceNumber || expense.reference_number) && (
                <div>
                  <span className="text-text-tertiary block">Reference</span>
                  <span className="font-medium">
                    {expense.referenceNumber || expense.reference_number}
                  </span>
                </div>
              )}
              <div>
                <span className="text-text-tertiary block">Posted to QB</span>
                {expense.quickbooks_journal_id || expense.quickbooksJournalId ? (
                  <Badge variant="success" size="sm">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    No
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

      {/* QuickBooks Status (legacy display for when no finance fields populated) */}
      {expense.status === "paid" &&
        (expense.quickbooks_journal_id || expense.quickbooksJournalId) &&
        !(
          expense.batchNumber ||
          expense.batch_number ||
          expense.paymentAccountName ||
          expense.payment_account_name ||
          expense.quickbooksExpenseAccountName ||
          expense.quickbooks_expense_account_name ||
          expense.paymentDate ||
          expense.payment_date ||
          expense.referenceNumber ||
          expense.reference_number
        ) && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">QuickBooks</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-text-tertiary block">Status</span>
                <Badge variant="success" size="sm">
                  Posted
                </Badge>
              </div>
              <div>
                <span className="text-text-tertiary block">Journal ID</span>
                <span className="font-medium">
                  {expense.quickbooks_journal_id || expense.quickbooksJournalId}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
