"use client";

/**
 * New Request Tab
 *
 * Form to create new expense requests with informative result modals.
 */

import { useState } from "react";
import {
  Input,
  Button,
  LabeledSelect,
  Textarea,
  Card,
  Spinner,
  ResultModal,
} from "@/src/components/ui";
import type { ResultModalVariant } from "@/src/components/ui/ResultModal";
import {
  useCreateExpense,
  useSubmitExpense,
  useCalculatePerDiem,
  useDepartments,
  useExpenseCategories,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import { Save, Check, XCircle, Info } from "@/src/lib/icons";
import { CURRENCY_OPTIONS } from "@/src/lib/constants";

const initialFormData = {
  expenseType: "expense",
  title: "",
  description: "",
  amount: "",
  currency: "RWF",
  expenseDate: new Date().toISOString().split("T")[0],
  categoryId: "",
  departmentId: "",
};

interface ResultModalState {
  isOpen: boolean;
  variant: ResultModalVariant;
  title: string;
  message: string;
  secondaryMessage?: string;
  actionLabel?: string;
}

export function NewRequestTab() {
  const { selectedEntityId } = useAuth();
  const { data: departments, isLoading: loadingDepartments } = useDepartments(
    selectedEntityId || undefined
  );
  const { data: categories, isLoading: loadingCategories } = useExpenseCategories(
    selectedEntityId || undefined
  );
  const createMutation = useCreateExpense();
  const submitMutation = useSubmitExpense();
  const perDiemMutation = useCalculatePerDiem();

  const [formData, setFormData] = useState(initialFormData);
  const [perDiemDays, setPerDiemDays] = useState("");
  const [perDiemDesignation, setPerDiemDesignation] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [perDiemCalculation, setPerDiemCalculation] = useState<any>(null);
  const [resultModal, setResultModal] = useState<ResultModalState>({
    isOpen: false,
    variant: "info",
    title: "",
    message: "",
  });

  const showResultModal = (
    variant: ResultModalVariant,
    title: string,
    message: string,
    secondaryMessage?: string,
    actionLabel?: string
  ) => {
    setResultModal({
      isOpen: true,
      variant,
      title,
      message,
      secondaryMessage,
      actionLabel,
    });
  };

  const closeResultModal = () => {
    setResultModal((prev) => ({ ...prev, isOpen: false }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPerDiemCalculation(null);
    setPerDiemDays("");
    setPerDiemDesignation("");
  };

  const handleCreateExpense = async (submitImmediately: boolean) => {
    if (!selectedEntityId) {
      showResultModal(
        "warning",
        "No Entity Selected",
        "Please select an entity from the dropdown in the header before creating an expense request.",
        "The entity determines which organization this expense will be submitted to."
      );
      return;
    }

    if (!formData.title || !formData.amount || !formData.categoryId || !formData.departmentId) {
      showResultModal(
        "warning",
        "Missing Required Fields",
        "Please fill in all required fields: Title, Amount, Category, and Department.",
        "All fields marked as required must be completed before submitting."
      );
      return;
    }

    try {
      // Step 1: Create the expense as draft
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const createdExpense: any = await createMutation.mutateAsync({
        entityId: selectedEntityId,
        departmentId: formData.departmentId,
        categoryId: formData.categoryId,
        expenseType: formData.expenseType as "expense" | "per_diem" | "advance",
        title: formData.title,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        expenseDate: formData.expenseDate,
        description: formData.description || undefined,
      });

      // Step 2: If submit immediately, call the submit endpoint
      if (submitImmediately && createdExpense?.expense?.id) {
        await submitMutation.mutateAsync(createdExpense.expense.id);
        showResultModal(
          "success",
          "Expense Submitted for Approval",
          `Your expense request "${formData.title}" for ${parseFloat(formData.amount).toLocaleString()} ${formData.currency} has been submitted successfully.`,
          "Your request is now pending approval. You will be notified once it has been reviewed by your approver.",
          "Done"
        );
      } else {
        showResultModal(
          "success",
          "Expense Saved as Draft",
          `Your expense request "${formData.title}" for ${parseFloat(formData.amount).toLocaleString()} ${formData.currency} has been saved as a draft.`,
          "You can find this draft in 'My Expenses' tab. Edit and submit it when you're ready.",
          "Done"
        );
      }
      resetForm();
    } catch (error) {
      console.error("Failed to create expense:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any;
      const statusCode = axiosError?.response?.status;
      const apiError = axiosError?.response?.data?.detail || "";

      // Display the error message from the backend
      // The backend should provide user-friendly messages
      const title =
        statusCode === 403
          ? "Permission Denied"
          : statusCode === 404
            ? "Resource Not Found"
            : statusCode === 422
              ? "Invalid Data"
              : "Unable to Create Expense";

      const message = apiError || "We encountered an issue while creating your expense request.";
      const fallbackMessage = !apiError
        ? "Please check your internet connection and try again. If the problem persists, contact support."
        : undefined;

      showResultModal("error", title, message, fallbackMessage, "OK");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateExpense(false);
  };

  const handleSubmitForApproval = async () => {
    await handleCreateExpense(true);
  };

  const handleCancel = () => {
    resetForm();
    showResultModal(
      "info",
      "Form Cleared",
      "All form fields have been reset.",
      "You can start entering a new expense request.",
      "OK"
    );
  };

  const calculatePerDiem = async () => {
    if (!perDiemDays || !perDiemDesignation) {
      showResultModal(
        "warning",
        "Missing Per Diem Details",
        "Please enter both the designation and number of days to calculate per diem.",
        "The designation should match your job role (e.g., Field Staff, Manager)."
      );
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
      showResultModal(
        "success",
        "Per Diem Calculated",
        `Your per diem for ${perDiemDays} days as "${perDiemDesignation}" is ${result.total_amount.toLocaleString()} ${result.currency || "RWF"}.`,
        "The amount has been automatically filled in the expense form.",
        "Continue"
      );
    } catch (error) {
      console.error("Failed to calculate per diem:", error);
      showResultModal(
        "error",
        "Per Diem Calculation Failed",
        `Could not find a per diem rate for the designation "${perDiemDesignation}".`,
        "Please verify the designation matches exactly with the configured rates, or contact your administrator to set up the rate.",
        "OK"
      );
    }
  };

  if (!selectedEntityId) {
    return (
      <Card variant="bordered">
        <div className="text-center py-12">
          <Info className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Entity Selected</h3>
          <p className="text-text-secondary mb-2">
            Please select an entity from the header dropdown to create a new expense request.
          </p>
          <p className="text-sm text-text-tertiary">
            The entity determines which organization this expense will be submitted to and who will
            approve it.
          </p>
        </div>
      </Card>
    );
  }

  if (loadingDepartments || loadingCategories) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <ResultModal
        isOpen={resultModal.isOpen}
        variant={resultModal.variant}
        title={resultModal.title}
        message={resultModal.message}
        secondaryMessage={resultModal.secondaryMessage}
        actionLabel={resultModal.actionLabel || "OK"}
        onAction={closeResultModal}
      />

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
                <Button
                  type="button"
                  variant="outline"
                  onClick={calculatePerDiem}
                  loading={perDiemMutation.isPending}
                  className="w-full"
                >
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
                  {perDiemCalculation.days} days ×{" "}
                  {perDiemCalculation.rate_per_day.toLocaleString()} RWF/day
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
              options={CURRENCY_OPTIONS}
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
          <Button
            type="submit"
            variant="primary"
            loading={createMutation.isPending || submitMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="secondary"
            loading={createMutation.isPending || submitMutation.isPending}
            onClick={handleSubmitForApproval}
          >
            <Check className="w-4 h-4 mr-2" />
            Submit for Approval
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createMutation.isPending || submitMutation.isPending}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
