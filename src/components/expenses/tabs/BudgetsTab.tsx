"use client";

/**
 * Budgets Tab (Admin Only)
 *
 * Budget management interface with creation, editing, and utilization tracking
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Card, Spinner, Badge } from "@/src/components/ui";
import { Plus, XCircle, Save, Briefcase, Edit, BarChart, Trash2 } from "@/src/lib/icons";

export function BudgetsTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: "",
    categoryId: "",
    budgetAmount: "",
    period: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    fiscalYear: new Date().getFullYear().toString(),
  });

  // Mock data - will be replaced with API call
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const budgets: any[] = [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: API call to create budget
    console.log("Creating budget:", formData);

    setTimeout(() => {
      setLoading(false);
      alert("Budget created successfully!");
      setShowCreateForm(false);
      setFormData({
        departmentId: "",
        categoryId: "",
        budgetAmount: "",
        period: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        fiscalYear: new Date().getFullYear().toString(),
      });
    }, 1000);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "bg-error";
    if (percentage >= 75) return "bg-warning";
    return "bg-success";
  };

  const getUtilizationBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="error">Over Budget</Badge>;
    if (percentage >= 90) return <Badge variant="warning">Critical</Badge>;
    if (percentage >= 75) return <Badge variant="warning">High</Badge>;
    return <Badge variant="success">Good</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Budget Overview</h3>
          <p className="text-sm text-text-secondary">
            Manage departmental budgets and track utilization
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </>
          )}
        </Button>
      </div>

      {/* Create Budget Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Create New Budget</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledSelect
                label="Department"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                options={[
                  { value: "", label: "Select department" },
                  { value: "ops", label: "Operations" },
                  { value: "fin", label: "Finance" },
                  { value: "hr", label: "Human Resources" },
                ]}
                required
              />

              <LabeledSelect
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                options={[
                  { value: "", label: "Select category" },
                  { value: "travel", label: "Travel" },
                  { value: "office", label: "Office Supplies" },
                  { value: "equipment", label: "Equipment" },
                ]}
                required
              />

              <Input
                label="Budget Amount (RWF)"
                type="number"
                value={formData.budgetAmount}
                onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                placeholder="5000000"
                required
              />

              <LabeledSelect
                label="Period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "quarterly", label: "Quarterly" },
                  { value: "annually", label: "Annually" },
                ]}
                required
              />

              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />

              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />

              <Input
                label="Fiscal Year"
                type="number"
                value={formData.fiscalYear}
                onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })}
                placeholder="2025"
                required
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={loading}>
                <Save className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Budget List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : budgets.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No budgets configured</h3>
            <p className="text-text-secondary mb-4">
              Create your first budget to start tracking expenses against limits.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {budgets.map((budget: any) => {
            const utilization = (budget.spent_amount / budget.budget_amount) * 100;

            return (
              <Card key={budget.id} variant="bordered" padding="md">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {budget.department_name} - {budget.category_name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {budget.period} • FY {budget.fiscal_year}
                    </p>
                  </div>
                  {getUtilizationBadge(utilization)}
                </div>

                {/* Budget Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-text-secondary">Budget</div>
                    <div className="text-lg font-bold text-text-primary">
                      {budget.budget_amount.toLocaleString()} RWF
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary">Spent</div>
                    <div className="text-lg font-bold text-text-primary">
                      {budget.spent_amount.toLocaleString()} RWF
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary">Remaining</div>
                    <div className="text-lg font-bold text-success">
                      {(budget.budget_amount - budget.spent_amount).toLocaleString()} RWF
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-text-secondary">Utilization</div>
                    <div className="text-lg font-bold text-text-primary">
                      {utilization.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-background-light rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${getUtilizationColor(utilization)}`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Period */}
                <div className="text-sm text-text-tertiary mb-4">
                  {new Date(budget.start_date).toLocaleDateString()} -{" "}
                  {new Date(budget.end_date).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <BarChart className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
