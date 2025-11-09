"use client";

/**
 * Expense Stats Component
 *
 * Displays high-level expense statistics overview
 */

import { Card, Badge, Spinner } from "@/src/components/ui";
import { useExpenseSummary } from "@/src/hooks/useExpenses";
import { BarChart, FileText, Clock, CheckCircle, XCircle, DollarSign } from "@/src/lib/icons";

export function ExpenseStats() {
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

  const statCards = [
    {
      label: "Total Expenses",
      value: stats.total_count,
      sublabel: formatCurrency(stats.total_amount),
      icon: <BarChart className="w-6 h-6" />,
      color: "text-blue",
    },
    {
      label: "Draft",
      value: stats.draft_count,
      icon: <FileText className="w-6 h-6" />,
      badge: "default" as const,
    },
    {
      label: "Pending Approval",
      value: stats.submitted_count,
      icon: <Clock className="w-6 h-6" />,
      badge: "warning" as const,
    },
    {
      label: "Approved",
      value: stats.approved_count,
      icon: <CheckCircle className="w-6 h-6" />,
      badge: "success" as const,
    },
    {
      label: "Rejected",
      value: stats.rejected_count,
      icon: <XCircle className="w-6 h-6" />,
      badge: "error" as const,
    },
    {
      label: "Paid",
      value: stats.paid_count,
      icon: <DollarSign className="w-6 h-6" />,
      badge: "success" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} variant="bordered" padding="md">
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
