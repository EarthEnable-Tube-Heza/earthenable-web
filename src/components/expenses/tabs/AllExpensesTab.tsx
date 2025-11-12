"use client";

/**
 * All Expenses Tab (Admin Only)
 *
 * Shows all expenses across the organization with advanced search and filtering
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Badge, Card, Spinner } from "@/src/components/ui";
import { Search, RefreshCw, BarChart, FileText, CheckCircle, XCircle, Eye } from "@/src/lib/icons";

export function AllExpensesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    expenseType: "all",
    departmentId: "",
    categoryId: "",
    submitterId: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [loading, setLoading] = useState(false);

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

  const getExpenseTypeBadge = (type: string) => {
    const badges = {
      expense: { variant: "default" as const, label: "Regular" },
      per_diem: { variant: "warning" as const, label: "Per Diem" },
      advance: { variant: "warning" as const, label: "Advance" },
    };
    const config = badges[type as keyof typeof badges] || {
      variant: "default" as const,
      label: type,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSearch = async () => {
    setLoading(true);
    // TODO: API call with filters
    console.log("Searching with filters:", filters);
    setTimeout(() => setLoading(false), 500);
  };

  const handleReset = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
      expenseType: "all",
      departmentId: "",
      categoryId: "",
      submitterId: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
  };

  const handleApprove = async (expenseId: string) => {
    // TODO: API call to approve expense
    console.log("Approving expense:", expenseId);
    alert("Expense approved successfully!");
  };

  const handleReject = async (expenseId: string) => {
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    // TODO: API call to reject expense
    console.log("Rejecting expense:", expenseId, reason);
    alert("Expense rejected successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Advanced Search Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">Advanced Search & Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Basic Search */}
          <Input
            label="Search"
            placeholder="Title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-3"
          />

          {/* Status Filter */}
          <LabeledSelect
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "submitted", label: "Pending Approval" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "paid", label: "Paid" },
            ]}
          />

          {/* Expense Type Filter */}
          <LabeledSelect
            label="Expense Type"
            value={filters.expenseType}
            onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
            options={[
              { value: "all", label: "All Types" },
              { value: "expense", label: "Regular Expense" },
              { value: "per_diem", label: "Per Diem" },
              { value: "advance", label: "Advance Payment" },
            ]}
          />

          {/* Department Filter */}
          <LabeledSelect
            label="Department"
            value={filters.departmentId}
            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
            options={[
              { value: "", label: "All Departments" },
              { value: "ops", label: "Operations" },
              { value: "fin", label: "Finance" },
              { value: "hr", label: "Human Resources" },
            ]}
          />

          {/* Category Filter */}
          <LabeledSelect
            label="Category"
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            options={[
              { value: "", label: "All Categories" },
              { value: "travel", label: "Travel" },
              { value: "office", label: "Office Supplies" },
              { value: "equipment", label: "Equipment" },
            ]}
          />

          {/* Date Range */}
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />

          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />

          {/* Amount Range */}
          <Input
            label="Min Amount"
            type="number"
            placeholder="0"
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
          />

          <Input
            label="Max Amount"
            type="number"
            placeholder="1000000"
            value={filters.maxAmount}
            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button variant="primary" onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
          <Button variant="secondary">
            <BarChart className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : expenses.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No expenses found</h3>
            <p className="text-text-secondary">
              Try adjusting your search filters or check back later.
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
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-text-primary">{expense.title}</h3>
                    {getStatusBadge(expense.status)}
                    {getExpenseTypeBadge(expense.expense_type)}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-text-secondary mb-2">{expense.description}</p>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-text-tertiary">
                    <div>
                      <span className="font-medium">Submitted by:</span> {expense.submitter_name}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {expense.department_name}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> {expense.amount}{" "}
                      {expense.currency}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  {expense.status === "submitted" && (
                    <>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(expense.id)}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleReject(expense.id)}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
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
