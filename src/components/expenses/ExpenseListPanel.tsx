"use client";

/**
 * ExpenseListPanel — Unified expense table component
 *
 * Replaces duplicated table rendering in MyExpensesTab and AllExpensesTab.
 * Row clicks open the drawer instead of navigating to a new page.
 */

import { useMemo } from "react";
import { Button, Badge, Card, Spinner } from "@/src/components/ui";
import {
  Eye,
  Wallet,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Paperclip,
  CheckCircle,
  XCircle,
} from "@/src/lib/icons";
import { Expense } from "@/src/lib/api/expenseClient";
import { getExpenseDisplayStatus } from "@/src/utils/expenseStatus";

interface ExpenseListPanelProps {
  expenses: Expense[];
  isLoading: boolean;
  isAdmin: boolean;
  onRowClick: (expenseId: string) => void;
  activeExpenseId?: string | null;
  // Selection for bulk actions
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  // Admin-specific inline actions
  onApproveClick?: (expense: Expense) => void;
  onRejectClick?: (expense: Expense) => void;
  // Empty state customization
  emptyIcon?: "wallet" | "file";
  emptyTitle?: string;
  emptyMessage?: string;
}

// Helpers for snake_case/camelCase compat
const getCategoryName = (e: Expense) => e.category_name || e.categoryName || "-";
const getExpenseTypeName = (e: Expense) => e.expense_type_name || e.expenseTypeName || "-";
const getExpenseTypeCode = (e: Expense) => e.expense_type_code || e.expenseTypeCode || "expense";
const getSubmitterName = (e: Expense) => e.submitter_name || e.submitterName || "Unknown";
const getDepartmentName = (e: Expense) => e.department_name || e.departmentName || "-";

const formatExpenseDate = (expense: Expense) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dateValue = expense.expense_date || (expense as any).expenseDate;
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString();
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "RWF",
    minimumFractionDigits: 0,
  }).format(amount);
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

export function ExpenseListPanel({
  expenses,
  isLoading,
  isAdmin,
  onRowClick,
  activeExpenseId,
  selectedIds,
  onSelectionChange,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onApproveClick,
  onRejectClick,
  emptyIcon = "wallet",
  emptyTitle,
  emptyMessage,
}: ExpenseListPanelProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return expenses.slice(start, start + pageSize);
  }, [expenses, currentPage, pageSize]);

  const isAllSelected =
    paginatedExpenses.length > 0 && selectedIds.size === paginatedExpenses.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(paginatedExpenses.map((e) => e.id)));
    }
  };

  const toggleSelectExpense = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (expenses.length === 0) {
    const EmptyIcon = emptyIcon === "file" ? FileText : Wallet;
    return (
      <Card variant="bordered">
        <div className="text-center py-12">
          <EmptyIcon className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {emptyTitle || "No expenses found"}
          </h3>
          <p className="text-text-secondary">
            {emptyMessage || "Try adjusting your search or filters."}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div>
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Title</th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Submitter
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Date</th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Department
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-text-primary">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedExpenses.map((expense) => (
              <tr
                key={expense.id}
                onClick={() => onRowClick(expense.id)}
                className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                  activeExpenseId === expense.id
                    ? "bg-primary/5 border-l-4 border-l-primary"
                    : selectedIds.has(expense.id)
                      ? "bg-primary/5"
                      : ""
                }`}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(expense.id)}
                    onChange={(e) =>
                      toggleSelectExpense(expense.id, e as unknown as React.MouseEvent)
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium text-text-primary">{expense.title}</p>
                      {(expense.attachmentCount || expense.attachment_count || 0) > 0 && (
                        <span
                          className="inline-flex items-center gap-0.5 text-text-tertiary"
                          title={`${expense.attachmentCount || expense.attachment_count} attachment(s)`}
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span className="text-xs">
                            {expense.attachmentCount || expense.attachment_count}
                          </span>
                        </span>
                      )}
                    </div>
                    {expense.description && (
                      <p className="text-sm text-text-secondary truncate max-w-[200px]">
                        {expense.description}
                      </p>
                    )}
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {getSubmitterName(expense)}
                  </td>
                )}
                <td className="px-4 py-3 text-text-primary font-medium">
                  {formatCurrency(expense.amount, expense.currency)}
                </td>
                <td className="px-4 py-3 text-text-secondary text-sm">
                  {formatExpenseDate(expense)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {getDepartmentName(expense)}
                  </td>
                )}
                <td className="px-4 py-3 text-text-secondary text-sm">
                  {getCategoryName(expense)}
                </td>
                <td className="px-4 py-3">
                  {getExpenseTypeBadge(getExpenseTypeCode(expense), getExpenseTypeName(expense))}
                </td>
                <td className="px-4 py-3">{getStatusBadge(expense)}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRowClick(expense.id)}
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {isAdmin && expense.status === "submitted" && onApproveClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApproveClick(expense)}
                        title="Approve"
                        className="text-status-success hover:bg-status-success/10"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    {isAdmin && expense.status === "submitted" && onRejectClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRejectClick(expense)}
                        title="Reject"
                        className="text-status-error hover:bg-status-error/10"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
          <p className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} expenses
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
