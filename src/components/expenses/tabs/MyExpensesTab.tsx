"use client";

/**
 * My Expenses Tab
 *
 * Shows user's own expenses with search, filters, and actions
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Badge, Card, Spinner } from "@/src/components/ui";
import { useExpenses, useSubmitExpense } from "@/src/hooks/useExpenses";
import { Search, Wallet, Calendar, Tag, Eye, Send } from "@/src/lib/icons";

export function MyExpensesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useExpenses({
    statusFilter: statusFilter === "all" ? undefined : statusFilter,
  });

  const submitMutation = useSubmitExpense();

  const expenses = data?.expenses || [];

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

  const handleSubmit = async (expenseId: string) => {
    try {
      await submitMutation.mutateAsync(expenseId);
      alert("Expense submitted successfully!");
    } catch {
      alert("Failed to submit expense");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
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
        <Button variant="primary">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {/* Expense List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : expenses.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
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
          {expenses.map((expense) => (
            <Card key={expense.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary">{expense.title}</h3>
                    {getStatusBadge(expense.status)}
                  </div>
                  {expense.description && (
                    <p className="text-sm text-text-secondary mb-2">{expense.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Wallet className="w-4 h-4" />
                      {expense.amount} {expense.currency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </span>
                    {expense.category_name && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {expense.category_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {expense.status === "draft" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmit(expense.id)}
                        loading={submitMutation.isPending}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Submit
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
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
