"use client";

/**
 * Expense Stats Component
 *
 * Displays high-level expense statistics overview
 */

import { useEffect, useState } from "react";
import { Card, Badge, Spinner } from "@/src/components/ui";

interface ExpenseSummary {
  total_count: number;
  total_amount: number;
  draft_count: number;
  submitted_count: number;
  approved_count: number;
  rejected_count: number;
  paid_count: number;
}

export function ExpenseStats() {
  const [stats, setStats] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API when implemented
    // For now, using mock data
    setTimeout(() => {
      setStats({
        total_count: 0,
        total_amount: 0,
        draft_count: 0,
        submitted_count: 0,
        approved_count: 0,
        rejected_count: 0,
        paid_count: 0,
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" variant="primary" />
        </div>
      </Card>
    );
  }

  if (!stats) {
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
      icon: "📊",
      color: "text-blue",
    },
    {
      label: "Draft",
      value: stats.draft_count,
      icon: "📝",
      badge: "default" as const,
    },
    {
      label: "Pending Approval",
      value: stats.submitted_count,
      icon: "⏳",
      badge: "warning" as const,
    },
    {
      label: "Approved",
      value: stats.approved_count,
      icon: "✅",
      badge: "success" as const,
    },
    {
      label: "Rejected",
      value: stats.rejected_count,
      icon: "❌",
      badge: "error" as const,
    },
    {
      label: "Paid",
      value: stats.paid_count,
      icon: "💸",
      badge: "success" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} variant="bordered" padding="md">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
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
