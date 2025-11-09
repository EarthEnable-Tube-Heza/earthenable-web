"use client";

/**
 * My Expenses Tab
 *
 * Shows user's own expenses with search, filters, and actions
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Badge, Card, Spinner } from "@/src/components/ui";

export function MyExpensesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading] = useState(false);

  // Mock data - will be replaced with API call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expenses: any[] = [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "warning" | "success" | "error"> = {
      draft: "default",
      submitted: "warning",
      approved: "success",
      rejected: "error",
      paid: "success",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search expenses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:col-span-2"
        />
        <LabeledSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "draft", label: "Draft" },
            { value: "submitted", label: "Pending Approval" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "paid", label: "Paid" },
          ]}
        />
        <Button variant="primary">🔍 Search</Button>
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : expenses.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No expenses found</h3>
            <p className="text-text-secondary">
              You haven&apos;t created any expense requests yet.
            </p>
            <p className="text-text-secondary mb-4">
              Click &quot;New Request&quot; tab to create your first expense.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {expenses.map((expense: any) => (
            <Card key={expense.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary">{expense.title}</h3>
                    {getStatusBadge(expense.status)}
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{expense.description}</p>
                  <div className="flex items-center gap-4 text-sm text-text-tertiary">
                    <span>
                      💰 {expense.amount} {expense.currency}
                    </span>
                    <span>📅 {new Date(expense.expense_date).toLocaleDateString()}</span>
                    <span>🏷️ {expense.category_name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {expense.status === "draft" && (
                    <>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="primary" size="sm">
                        Submit
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
