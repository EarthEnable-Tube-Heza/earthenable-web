"use client";

/**
 * BudgetImpactPanel — Extracted from AllExpensesTab
 *
 * Shows how approving an expense affects department budget.
 */

import { BarChart, AlertTriangle } from "@/src/lib/icons";
import { TrendingUp } from "@/src/lib/icons";
import { Budget } from "@/src/lib/api/expenseClient";

function formatCurrencyAmount(amount: number, currency: string = "RWF") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface BudgetImpactPanelProps {
  departmentBudget: Budget | null;
  expenseAmount: number;
  expenseCurrency: string;
}

export function BudgetImpactPanel({
  departmentBudget,
  expenseAmount,
  expenseCurrency,
}: BudgetImpactPanelProps) {
  if (!departmentBudget) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-500 text-center">
          No budget configured for this department
        </p>
      </div>
    );
  }

  const currentUtilization = departmentBudget.utilizationPercentage;
  const newSpent = departmentBudget.spentAmount + expenseAmount;
  const newUtilization =
    departmentBudget.allocatedAmount > 0 ? (newSpent / departmentBudget.allocatedAmount) * 100 : 0;
  const newRemaining = departmentBudget.allocatedAmount - newSpent;
  const willExceedBudget = newUtilization > 100;
  const willBeAtRisk = newUtilization >= 85 && newUtilization <= 100;

  const getStatusColor = (util: number) => {
    if (util > 100) return "text-status-error";
    if (util >= 85) return "text-status-warning";
    return "text-status-success";
  };

  const getBarColor = (util: number) => {
    if (util > 100) return "bg-status-error";
    if (util >= 85) return "bg-status-warning";
    return "bg-status-success";
  };

  return (
    <div
      className={`rounded-lg p-4 border ${
        willExceedBudget
          ? "bg-red-50 border-red-200"
          : willBeAtRisk
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        {willExceedBudget ? (
          <TrendingUp className="w-5 h-5 text-status-error" />
        ) : willBeAtRisk ? (
          <AlertTriangle className="w-5 h-5 text-status-warning" />
        ) : (
          <BarChart className="w-5 h-5 text-status-success" />
        )}
        <span className="font-semibold text-sm">
          {departmentBudget.departmentName} Budget Impact
        </span>
      </div>

      {willExceedBudget && (
        <div className="bg-red-100 text-red-800 text-sm p-2 rounded mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Approving this expense will put the department{" "}
            <strong>{formatCurrencyAmount(Math.abs(newRemaining), expenseCurrency)}</strong> over
            budget
          </span>
        </div>
      )}

      {willBeAtRisk && !willExceedBudget && (
        <div className="bg-yellow-100 text-yellow-800 text-sm p-2 rounded mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Budget will be at risk level ({newUtilization.toFixed(0)}% utilized)</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-500">Budget:</span>
          <span className="ml-2 font-medium">
            {formatCurrencyAmount(departmentBudget.allocatedAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Currently Spent:</span>
          <span className="ml-2 font-medium">
            {formatCurrencyAmount(departmentBudget.spentAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">This Expense:</span>
          <span className="ml-2 font-medium text-primary">
            +{formatCurrencyAmount(expenseAmount, expenseCurrency)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">After Approval:</span>
          <span className={`ml-2 font-medium ${getStatusColor(newUtilization)}`}>
            {formatCurrencyAmount(newSpent, expenseCurrency)}
          </span>
        </div>
      </div>

      {/* Utilization Bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Current: {currentUtilization.toFixed(0)}%</span>
          <span className={`font-semibold ${getStatusColor(newUtilization)}`}>
            After: {newUtilization.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
          <div
            className={`absolute h-full ${getBarColor(currentUtilization)} opacity-50`}
            style={{ width: `${Math.min(currentUtilization, 100)}%` }}
          />
          <div
            className={`absolute h-full ${getBarColor(newUtilization)}`}
            style={{ width: `${Math.min(newUtilization, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-400">
          <span>0%</span>
          <span>85%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
