"use client";

/**
 * Expense Stats Component
 *
 * Displays high-level expense statistics overview with clickable cards
 * that can filter the expenses table by status.
 */

import { Card, Badge, Spinner } from "@/src/components/ui";
import { useExpenseSummary } from "@/src/hooks/useExpenses";
import { BarChart, FileText, Clock, CheckCircle, XCircle, DollarSign } from "@/src/lib/icons";

export type ExpenseStatusFilter = "all" | "draft" | "submitted" | "approved" | "rejected" | "paid";

interface ExpenseStatsProps {
  onStatusClick?: (status: ExpenseStatusFilter) => void;
}

export function ExpenseStats({ onStatusClick }: ExpenseStatsProps) {
  const { data: stats, isLoading, error } = useExpenseSummary();

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" variant="primary" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card variant="bordered">
        <div className="text-center py-4 text-text-secondary">
          Unable to load expense statistics
        </div>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle both snake_case and camelCase from backend
  const totalCount = stats.total_count ?? stats.totalCount ?? 0;
  const totalAmount = stats.total_amount ?? stats.totalAmount ?? 0;
  const draftCount = stats.draft_count ?? stats.draftCount ?? 0;
  const submittedCount = stats.submitted_count ?? stats.submittedCount ?? 0;
  const approvedCount = stats.approved_count ?? stats.approvedCount ?? 0;
  const rejectedCount = stats.rejected_count ?? stats.rejectedCount ?? 0;
  const paidCount = stats.paid_count ?? stats.paidCount ?? 0;

  const statCards: Array<{
    label: string;
    value: number;
    sublabel?: string;
    icon: React.ReactNode;
    color?: string;
    badge?: "default" | "warning" | "success" | "error" | "info";
    statusFilter: ExpenseStatusFilter;
  }> = [
    {
      label: "Total Expenses",
      value: totalCount,
      sublabel: formatCurrency(totalAmount),
      icon: <BarChart className="w-6 h-6" />,
      color: "text-blue",
      statusFilter: "all",
    },
    {
      label: "Draft",
      value: draftCount,
      icon: <FileText className="w-6 h-6" />,
      badge: "default" as const,
      statusFilter: "draft",
    },
    {
      label: "Pending Approval",
      value: submittedCount,
      icon: <Clock className="w-6 h-6" />,
      badge: "warning" as const,
      statusFilter: "submitted",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: <CheckCircle className="w-6 h-6" />,
      badge: "success" as const,
      statusFilter: "approved",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: <XCircle className="w-6 h-6" />,
      badge: "error" as const,
      statusFilter: "rejected",
    },
    {
      label: "Paid",
      value: paidCount,
      icon: <DollarSign className="w-6 h-6" />,
      badge: "success" as const,
      statusFilter: "paid",
    },
  ];

  const handleCardClick = (statusFilter: ExpenseStatusFilter) => {
    if (onStatusClick) {
      onStatusClick(statusFilter);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          variant="bordered"
          padding="md"
          className={
            onStatusClick
              ? "cursor-pointer hover:border-primary hover:shadow-md transition-all"
              : ""
          }
          onClick={() => handleCardClick(stat.statusFilter)}
        >
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary">{stat.icon}</span>
              {stat.badge && (
                <Badge variant={stat.badge} size="sm">
                  {stat.value}
                </Badge>
              )}
            </div>
            <div className={`text-2xl font-bold ${stat.color || "text-text-primary"}`}>
              {!stat.badge && stat.value}
            </div>
            <div className="text-sm text-text-secondary mt-1">{stat.label}</div>
            {stat.sublabel && (
              <div className="text-xs text-text-tertiary mt-1">{stat.sublabel}</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
