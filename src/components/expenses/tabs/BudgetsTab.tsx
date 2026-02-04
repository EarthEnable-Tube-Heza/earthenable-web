"use client";

/**
 * Budgets Tab (Admin/Approver View)
 *
 * Shows departmental budget tracking with budget vs actual expenditure,
 * utilization indicators, and category breakdowns.
 */

import { useState } from "react";
import { Card, Spinner, Badge } from "@/src/components/ui";
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  PieChart,
} from "@/src/lib/icons";
import { useBudgetSummary, useBudgets } from "@/src/hooks/useExpenses";
import type { Budget, DepartmentBudgetSummary } from "@/src/lib/api/expenseClient";

/**
 * Get status badge based on budget utilization
 */
function getStatusBadge(status: string) {
  if (status === "over_budget") {
    return (
      <Badge variant="error" size="sm">
        <TrendingUp className="w-3 h-3 mr-1" />
        Over Budget
      </Badge>
    );
  }
  if (status === "at_risk") {
    return (
      <Badge variant="warning" size="sm">
        <AlertTriangle className="w-3 h-3 mr-1" />
        At Risk
      </Badge>
    );
  }
  return (
    <Badge variant="success" size="sm">
      <TrendingDown className="w-3 h-3 mr-1" />
      On Track
    </Badge>
  );
}

/**
 * Get utilization bar color based on percentage
 */
function getUtilizationColor(percentage: number) {
  if (percentage >= 100) return "bg-status-error";
  if (percentage >= 85) return "bg-status-warning";
  return "bg-status-success";
}

/**
 * Format currency amount
 */
function formatAmount(amount: number, currency: string = "RWF") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Department Budget Card - expandable with category breakdown
 */
function DepartmentBudgetCard({
  department,
  budgets,
}: {
  department: {
    departmentId: string;
    departmentName: string;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
    status: string;
  };
  budgets: Array<{
    id: string;
    name: string;
    categoryId: string | null;
    categoryName: string | null;
    allocatedAmount: number;
    spentAmount: number;
    remainingAmount: number;
    utilizationPercentage: number;
    status: string;
  }>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter to get only category-level budgets for this department
  const categoryBudgets = budgets.filter((b) => b.categoryId !== null && b.categoryName);

  return (
    <Card variant="bordered" padding="md">
      {/* Department Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => categoryBudgets.length > 0 && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {categoryBudgets.length > 0 && (
            <button className="p-1 hover:bg-background-light rounded">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-text-tertiary" />
              ) : (
                <ChevronRight className="w-5 h-5 text-text-tertiary" />
              )}
            </button>
          )}
          <div>
            <h3 className="font-semibold text-text-primary">{department.departmentName}</h3>
            <p className="text-sm text-text-secondary">
              Q1 2026 • {categoryBudgets.length} expense categories
            </p>
          </div>
        </div>
        {getStatusBadge(department.status)}
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <div className="text-sm text-text-secondary">Budget</div>
          <div className="text-lg font-bold text-text-primary">
            {formatAmount(department.allocatedAmount)}
          </div>
        </div>
        <div>
          <div className="text-sm text-text-secondary">Spent</div>
          <div className="text-lg font-bold text-text-primary">
            {formatAmount(department.spentAmount)}
          </div>
        </div>
        <div>
          <div className="text-sm text-text-secondary">Remaining</div>
          <div
            className={`text-lg font-bold ${
              department.remainingAmount < 0 ? "text-status-error" : "text-status-success"
            }`}
          >
            {formatAmount(department.remainingAmount)}
          </div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Utilization</span>
          <span
            className={`font-semibold ${
              department.utilizationPercentage > 100
                ? "text-status-error"
                : department.utilizationPercentage >= 85
                  ? "text-status-warning"
                  : "text-text-primary"
            }`}
          >
            {department.utilizationPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-background-light rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${getUtilizationColor(department.utilizationPercentage)}`}
            style={{ width: `${Math.min(department.utilizationPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Breakdown (Expanded) */}
      {isExpanded && categoryBudgets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-primary">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-text-primary">
              Expense Category Breakdown
            </span>
          </div>
          <div className="space-y-3">
            {categoryBudgets.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary">{cat.categoryName}</span>
                    <span className="text-sm font-medium">
                      {formatAmount(cat.spentAmount)} / {formatAmount(cat.allocatedAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-background-light rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getUtilizationColor(cat.utilizationPercentage)}`}
                      style={{ width: `${Math.min(cat.utilizationPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`ml-3 text-sm font-semibold w-14 text-right ${
                    cat.utilizationPercentage > 100
                      ? "text-status-error"
                      : cat.utilizationPercentage >= 85
                        ? "text-status-warning"
                        : "text-text-secondary"
                  }`}
                >
                  {cat.utilizationPercentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export function BudgetsTab() {
  const { data: summaryData, isLoading: summaryLoading } = useBudgetSummary();
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets();

  const isLoading = summaryLoading || budgetsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  const summary = summaryData;
  const budgets = budgetsData?.budgets || [];

  // Group budgets by department
  const departmentBudgets = new Map<
    string,
    {
      overallBudget: DepartmentBudgetSummary | null;
      categoryBudgets: Budget[];
    }
  >();

  // First, add department summaries
  if (summary?.departments) {
    summary.departments.forEach((dept) => {
      departmentBudgets.set(dept.departmentId, {
        overallBudget: dept,
        categoryBudgets: [],
      });
    });
  }

  // Then, add category budgets to their departments
  budgets.forEach((budget) => {
    const existing = departmentBudgets.get(budget.departmentId);
    if (existing && budget.categoryId) {
      existing.categoryBudgets.push(budget);
    }
  });

  if (!summary || summary.departmentCount === 0) {
    return (
      <Card variant="bordered">
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No budgets configured</h3>
          <p className="text-text-secondary mb-4">
            Budget tracking will appear here once budgets are set up for departments.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Q1 2026 Budget Overview</h3>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-background-light rounded-lg">
            <div className="text-2xl font-bold text-text-primary">
              {formatAmount(summary.totalAllocated)}
            </div>
            <div className="text-sm text-text-secondary">Total Allocated</div>
          </div>
          <div className="text-center p-4 bg-background-light rounded-lg">
            <div className="text-2xl font-bold text-text-primary">
              {formatAmount(summary.totalSpent)}
            </div>
            <div className="text-sm text-text-secondary">Total Spent</div>
          </div>
          <div className="text-center p-4 bg-background-light rounded-lg">
            <div
              className={`text-2xl font-bold ${
                summary.totalRemaining < 0 ? "text-status-error" : "text-status-success"
              }`}
            >
              {formatAmount(summary.totalRemaining)}
            </div>
            <div className="text-sm text-text-secondary">Remaining</div>
          </div>
          <div className="text-center p-4 bg-background-light rounded-lg">
            <div
              className={`text-2xl font-bold ${
                summary.overallUtilization > 100
                  ? "text-status-error"
                  : summary.overallUtilization >= 85
                    ? "text-status-warning"
                    : "text-text-primary"
              }`}
            >
              {summary.overallUtilization.toFixed(1)}%
            </div>
            <div className="text-sm text-text-secondary">Utilization</div>
          </div>
        </div>

        {/* Status Counts */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t border-border-primary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-success" />
            <span className="text-sm text-text-secondary">{summary.onTrackCount} On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-warning" />
            <span className="text-sm text-text-secondary">{summary.atRiskCount} At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-status-error" />
            <span className="text-sm text-text-secondary">
              {summary.overBudgetCount} Over Budget
            </span>
          </div>
        </div>
      </Card>

      {/* Department Budget Cards */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Department Budgets ({summary.departmentCount})
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {summary.departments.map((dept) => {
            const deptData = departmentBudgets.get(dept.departmentId);
            return (
              <DepartmentBudgetCard
                key={dept.departmentId}
                department={dept}
                budgets={deptData?.categoryBudgets || []}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
