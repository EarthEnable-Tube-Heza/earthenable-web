"use client";

/**
 * Approval History Tab
 *
 * Shows all expenses that have passed through the current user's approval,
 * including pending, approved, and rejected — with the expense's current
 * lifecycle status so approvers can track outcomes (e.g. paid by finance).
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input, Button, LabeledSelect, Badge, Card, Spinner } from "@/src/components/ui";
import {
  Search,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "@/src/lib/icons";
import { useApprovalHistory } from "@/src/hooks/useExpenses";
import { ApprovalHistoryItem } from "@/src/lib/api/expenseClient";
import { getExpenseDisplayStatus } from "@/src/utils/expenseStatus";

function formatCurrencyAmount(amount: number, currency: string = "RWF") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getApprovalStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge variant="success">Approved</Badge>;
    case "rejected":
      return <Badge variant="error">Rejected</Badge>;
    case "pending":
      return <Badge variant="warning">Pending</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
}

function getExpenseStatusBadge(item: ApprovalHistoryItem) {
  const { label, variant } = getExpenseDisplayStatus({
    status: item.expenseStatus,
    current_approval_phase: item.chain,
    current_step: item.stepOrder,
    total_steps: item.totalSteps,
  });
  return <Badge variant={variant}>{label}</Badge>;
}

function getExpenseTypeBadge(code: string, name: string) {
  const variants: Record<string, "default" | "warning" | "info"> = {
    expense: "default",
    per_diem: "warning",
    advance: "info",
  };
  const variant = variants[code] || "default";
  return <Badge variant={variant}>{name || code || "Expense"}</Badge>;
}

interface ApprovalHistoryTabProps {
  onRowClick?: (expenseId: string) => void;
  activeExpenseId?: string | null;
}

export function ApprovalHistoryTab({ onRowClick, activeExpenseId }: ApprovalHistoryTabProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "all"
  );

  // Don't filter by entity — approvals are user-scoped
  const { data: historyData, isLoading } = useApprovalHistory();

  const approvals = useMemo(() => historyData?.approvals || [], [historyData?.approvals]);

  // Filter by approval status
  const statusFiltered = useMemo(() => {
    if (statusFilter === "all") return approvals;
    return approvals.filter((item) => item.approvalStatus === statusFilter);
  }, [approvals, statusFilter]);

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return statusFiltered;
    const query = searchQuery.toLowerCase();
    return statusFiltered.filter(
      (item) =>
        item.expenseTitle.toLowerCase().includes(query) ||
        (item.submitterName || "").toLowerCase().includes(query) ||
        (item.departmentName || "").toLowerCase().includes(query)
    );
  }, [statusFiltered, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleViewExpense = (expenseId: string) => {
    if (onRowClick) {
      onRowClick(expenseId);
    } else {
      router.push(`/dashboard/expenses/${expenseId}`);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  // Counts for filter badges
  const counts = useMemo(() => {
    const c = { all: approvals.length, pending: 0, approved: 0, rejected: 0 };
    approvals.forEach((a) => {
      if (a.approvalStatus === "pending") c.pending++;
      else if (a.approvalStatus === "approved") c.approved++;
      else if (a.approvalStatus === "rejected") c.rejected++;
    });
    return c;
  }, [approvals]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">
          Approval History ({filteredItems.length})
        </h3>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "approved", "pending", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === s
                ? "bg-primary text-white border-primary"
                : "bg-white text-text-secondary border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 opacity-75">({counts[s]})</span>
          </button>
        ))}
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

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {searchQuery || statusFilter !== "all"
                ? "No matching approvals"
                : "No approval history"}
            </h3>
            <p className="text-text-secondary">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Expenses you review will appear here."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
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
                  Your Decision
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Expense Status
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
                      : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text-primary">{item.expenseTitle}</p>
                    {item.approvalComments && (
                      <p
                        className="text-xs text-text-tertiary mt-0.5 truncate max-w-[200px]"
                        title={item.approvalComments}
                      >
                        &ldquo;{item.approvalComments}&rdquo;
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {item.submitterName || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-text-primary font-medium">
                    {formatCurrencyAmount(item.expenseAmount, item.expenseCurrency)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {formatDate(item.approvedAt || item.submittedAt || item.expenseDate)}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-sm">
                    {item.departmentName || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {getExpenseTypeBadge(item.expenseTypeCode || "", item.expenseTypeName || "")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {getApprovalStatusBadge(item.approvalStatus)}
                      <span className="text-xs text-text-tertiary">
                        Step {item.stepOrder}/{item.totalSteps}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {getExpenseStatusBadge(item)}
                      {item.expenseStatus === "paid" && item.paidAt && (
                        <span className="text-[10px] text-text-tertiary">
                          {formatDate(item.paidAt)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewExpense(item.expenseId)}
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
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
    </div>
  );
}
