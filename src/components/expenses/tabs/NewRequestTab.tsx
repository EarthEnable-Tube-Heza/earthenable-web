"use client";

/**
 * New Request Tab
 *
 * Form to create new expense requests
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Textarea, Card, Spinner } from "@/src/components/ui";
import {
  useCreateExpense,
  useCalculatePerDiem,
  useDepartments,
  useExpenseCategories,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import { Save, Check, XCircle, Info } from "@/src/lib/icons";

export function NewRequestTab() {
  const { user } = useAuth();
  const { data: departments, isLoading: loadingDepartments } = useDepartments();
  const { data: categories, isLoading: loadingCategories } = useExpenseCategories();
  const createMutation = useCreateExpense();
  const perDiemMutation = useCalculatePerDiem();

  const [formData, setFormData] = useState({
    expenseType: "expense",
    title: "",
    description: "",
    amount: "",
    currency: "RWF",
    expenseDate: new Date().toISOString().split("T")[0],
    categoryId: "",
    departmentId: "",
  });

  const [perDiemDays, setPerDiemDays] = useState("");
  const [perDiemDesignation, setPerDiemDesignation] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [perDiemCalculation, setPerDiemCalculation] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.entity_id) {
      alert("User entity not found");
      return;
    }

    try {
      await createMutation.mutateAsync({
        entityId: user.entity_id,
        departmentId: formData.departmentId,
        categoryId: formData.categoryId,
        expenseType: formData.expenseType as "expense" | "per_diem" | "advance",
        title: formData.title,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        expenseDate: formData.expenseDate,
        description: formData.description || undefined,
      });

      alert("Expense created successfully!");
      // Reset form
      setFormData({
        expenseType: "expense",
        title: "",
        description: "",
        amount: "",
        currency: "RWF",
        expenseDate: new Date().toISOString().split("T")[0],
        categoryId: "",
        departmentId: "",
      });
      setPerDiemCalculation(null);
    } catch (error) {
      alert("Failed to create expense");
      console.error(error);
    }
  };

  const calculatePerDiem = async () => {
    if (!perDiemDays || !perDiemDesignation) {
      alert("Please enter days and designation");
      return;
    }

    try {
      const result = await perDiemMutation.mutateAsync({
        designation: perDiemDesignation,
        days: parseInt(perDiemDays),
      });

      setPerDiemCalculation(result);
      setFormData((prev) => ({
        ...prev,
        amount: String(result.total_amount),
      }));
    } catch (error) {
      alert("Failed to calculate per diem");
      console.error(error);
    }
  };

  if (loadingDepartments || loadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Expense Type Selection */}
      <Card variant="elevated" padding="md">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Expense Type</h3>
        <LabeledSelect
          label="Type"
          value={formData.expenseType}
          onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
          options={[
            { value: "expense", label: "Regular Expense" },
            { value: "per_diem", label: "Per Diem" },
            { value: "advance", label: "Advance Payment" },
          ]}
          required
        />
      </Card>

      {/* Per Diem Calculator */}
      {formData.expenseType === "per_diem" && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-info" />
            <h3 className="text-lg font-semibold text-text-primary">Per Diem Calculator</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Designation"
              value={perDiemDesignation}
              onChange={(e) => setPerDiemDesignation(e.target.value)}
              placeholder="e.g., Field Staff"
            />
            <Input
              label="Number of Days"
              type="number"
              value={perDiemDays}
              onChange={(e) => setPerDiemDays(e.target.value)}
              placeholder="5"
            />
            <div className="flex items-end">
              <Button type="button" variant="outline" onClick={calculatePerDiem} className="w-full">
                Calculate
              </Button>
            </div>
          </div>

          {perDiemCalculation && (
            <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="text-sm text-text-secondary mb-2">Calculation Result:</div>
              <div className="text-2xl font-bold text-success">
                {perDiemCalculation.total_amount.toLocaleString()} RWF
              </div>
              <div className="text-sm text-text-tertiary mt-1">
                {perDiemCalculation.days} days × {perDiemCalculation.rate_per_day.toLocaleString()}{" "}
                RWF/day
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Expense Details */}
      <Card variant="elevated" padding="md">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Expense Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Travel to Kigali"
            required
          />

          <LabeledSelect
            label="Category"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            options={[
              { value: "", label: "Select category" },
              ...(categories?.categories || []).map((cat) => ({
                value: cat.id,
                label: cat.name,
              })),
            ]}
            required
          />

          <Input
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="50000"
            required
          />

          <LabeledSelect
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            options={[
              { value: "RWF", label: "RWF - Rwandan Franc" },
              { value: "USD", label: "USD - US Dollar" },
              { value: "EUR", label: "EUR - Euro" },
            ]}
            required
          />

          <Input
            label="Expense Date"
            type="date"
            value={formData.expenseDate}
            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            required
          />

          <LabeledSelect
            label="Department"
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            options={[
              { value: "", label: "Select department" },
              ...(departments?.departments || []).map((dept) => ({
                value: dept.id,
                label: dept.name,
              })),
            ]}
            required
          />

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about this expense..."
              rows={4}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button type="submit" variant="primary" loading={createMutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>
        <Button type="button" variant="secondary" loading={createMutation.isPending}>
          <Check className="w-4 h-4 mr-2" />
          Submit for Approval
        </Button>
        <Button type="button" variant="outline">
          <XCircle className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
