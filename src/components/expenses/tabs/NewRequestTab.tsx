"use client";

/**
 * New Request Tab
 *
 * Form to create new expense requests
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Textarea, Card } from "@/src/components/ui";

export function NewRequestTab() {
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: API call to create expense
    console.log("Creating expense:", formData);

    setTimeout(() => {
      setLoading(false);
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
    }, 1000);
  };

  const calculatePerDiem = async () => {
    if (!perDiemDays || !perDiemDesignation) {
      alert("Please enter days and designation");
      return;
    }

    // TODO: API call to calculate per diem
    const mockCalculation = {
      designation: perDiemDesignation,
      days: parseInt(perDiemDays),
      rate_per_day: 25000,
      total_amount: 25000 * parseInt(perDiemDays),
    };

    setPerDiemCalculation(mockCalculation);
    setFormData((prev) => ({
      ...prev,
      amount: String(mockCalculation.total_amount),
    }));
  };

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
          <h3 className="text-lg font-semibold text-text-primary mb-4">💡 Per Diem Calculator</h3>
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
              { value: "travel", label: "Travel" },
              { value: "office", label: "Office Supplies" },
              { value: "equipment", label: "Equipment" },
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
              { value: "ops", label: "Operations" },
              { value: "fin", label: "Finance" },
              { value: "hr", label: "Human Resources" },
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
        <Button type="submit" variant="primary" loading={loading}>
          💾 Save as Draft
        </Button>
        <Button type="button" variant="secondary" loading={loading}>
          ✅ Submit for Approval
        </Button>
        <Button type="button" variant="outline">
          ❌ Cancel
        </Button>
      </div>
    </form>
  );
}
