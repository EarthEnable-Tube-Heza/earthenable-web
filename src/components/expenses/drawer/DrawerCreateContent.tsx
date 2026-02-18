"use client";

/**
 * DrawerCreateContent — Create/edit form extracted from NewRequestTab.
 *
 * Does NOT render FileUpload or action buttons (those are in the drawer
 * right panel and footer respectively).
 */

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Input, LabeledSelect, Textarea, Card, Spinner, Button } from "@/src/components/ui";
import {
  useCreateExpense,
  useSubmitExpense,
  useUpdateExpense,
  useCalculatePerDiem,
  useExpenseCategories,
  useExpenseTypes,
  useCurrentUserEmployee,
  useExpense,
} from "@/src/hooks/useExpenses";
import { uploadExpenseAttachment } from "@/src/lib/api/expenseClient";
import { useAuth } from "@/src/lib/auth";
import { AlertTriangle, Info, RefreshCw, X } from "@/src/lib/icons";
import { useAutoSaveDraft, DraftFormData } from "@/src/hooks/useAutoSaveDraft";

const initialFormData = {
  expenseTypeId: "",
  title: "",
  description: "",
  amount: "",
  currency: "RWF",
  expenseDate: new Date().toISOString().split("T")[0],
  categoryId: "",
  accountName: "",
  accountNumber: "",
  bankName: "",
};

export interface DrawerCreateContentRef {
  handleSave: (submitImmediately: boolean) => Promise<void>;
  isSaving: boolean;
  isSubmitting: boolean;
  /** Whether the category requires a receipt */
  categoryRequiresReceipt: boolean;
  /** Clear auto-saved draft from localStorage */
  clearDraft: () => void;
  /** Inline error for the attachment section (set on submit validation) */
  attachmentError: string;
}

interface DrawerCreateContentProps {
  /** If provided, loads expense for editing */
  expenseId?: string | null;
  /** Files managed by parent (displayed in right panel) */
  files: File[];
  /** Callback after successful save/submit */
  onSuccess: (expenseId: string, wasSubmitted: boolean) => void;
  /** Callback on error */
  onError: (message: string) => void;
}

export const DrawerCreateContent = forwardRef<DrawerCreateContentRef, DrawerCreateContentProps>(
  function DrawerCreateContent({ expenseId, files, onSuccess, onError }, ref) {
    const { selectedEntityId } = useAuth();
    const { data: currentUserData, isLoading: loadingEmployee } = useCurrentUserEmployee();
    const { data: categories, isLoading: loadingCategories } = useExpenseCategories(
      selectedEntityId || undefined
    );
    const { data: typesData } = useExpenseTypes(selectedEntityId || undefined);
    const { data: existingExpense } = useExpense(expenseId || "");

    const employeeDepartment = currentUserData?.employee?.department;
    const hasDepartment = !!employeeDepartment?.id;
    const entityCurrency = currentUserData?.employee?.entity?.currency || "";
    const entityCurrencies = currentUserData?.employee?.entity?.currencies || [];
    const activeCurrencies = entityCurrencies;
    const hasMultipleCurrencies = activeCurrencies.length > 1;
    const defaultCurrency = activeCurrencies.find((c) => c.is_default);

    const createMutation = useCreateExpense();
    const updateMutation = useUpdateExpense();
    const submitMutation = useSubmitExpense();
    const perDiemMutation = useCalculatePerDiem();

    // Auto-save draft (only for create mode, not edit)
    const { hasSavedDraft, getSavedDraft, saveDraft, clearDraft } = useAutoSaveDraft();
    const [showRestoreBanner, setShowRestoreBanner] = useState(false);
    const [draftChecked, setDraftChecked] = useState(false);

    const [formData, setFormData] = useState(initialFormData);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [attachmentError, setAttachmentError] = useState("");
    const [perDiemDays, setPerDiemDays] = useState("");
    const [perDiemDesignation, setPerDiemDesignation] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [perDiemCalculation, setPerDiemCalculation] = useState<any>(null);

    // Set currency from entity when employee data loads
    useEffect(() => {
      if (defaultCurrency) {
        setFormData((prev) => ({ ...prev, currency: defaultCurrency.currency_code }));
      } else if (entityCurrency) {
        setFormData((prev) => ({ ...prev, currency: entityCurrency }));
      }
    }, [entityCurrency, defaultCurrency]);

    // Pre-fill form for edit mode
    useEffect(() => {
      if (existingExpense && expenseId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exp = existingExpense as any;
        const actual = exp.expense || exp;
        setFormData({
          expenseTypeId: actual.expense_type_id || actual.expenseTypeId || "",
          title: actual.title || "",
          description: actual.description || "",
          amount: actual.amount ? String(actual.amount) : "",
          currency: actual.currency || formData.currency,
          expenseDate:
            (actual.expense_date || actual.expenseDate || "").split("T")[0] ||
            new Date().toISOString().split("T")[0],
          categoryId: actual.category_id || "",
          accountName: actual.account_name || actual.accountName || "",
          accountNumber: actual.account_number || actual.accountNumber || "",
          bankName: actual.bank_name || actual.bankName || "",
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingExpense, expenseId]);

    // Check for saved draft on mount (create mode only)
    useEffect(() => {
      if (!expenseId && !draftChecked && hasSavedDraft) {
        setShowRestoreBanner(true);
      }
      setDraftChecked(true);
    }, [expenseId, draftChecked, hasSavedDraft]);

    // Auto-save form data on changes (create mode only)
    useEffect(() => {
      if (!expenseId && draftChecked) {
        saveDraft(formData as DraftFormData);
      }
    }, [formData, expenseId, draftChecked, saveDraft]);

    // Clear attachment error when files are added
    useEffect(() => {
      if (files.length > 0 && attachmentError) {
        setAttachmentError("");
      }
    }, [files.length, attachmentError]);

    const selectedCurrencyInfo = activeCurrencies.find(
      (c) => c.currency_code === formData.currency
    );
    const showExchangeRate =
      selectedCurrencyInfo &&
      !selectedCurrencyInfo.is_default &&
      selectedCurrencyInfo.exchange_rate != null &&
      defaultCurrency;

    const selectedCategory = (categories?.categories || []).find(
      (cat) => cat.id === formData.categoryId
    );
    const categoryRequiresReceipt = selectedCategory?.requires_receipt ?? false;

    const updateField = (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

    const validate = (submitMode: boolean): Record<string, string> => {
      const errors: Record<string, string> = {};
      if (!formData.title.trim()) errors.title = "Title is required.";
      if (!formData.amount) errors.amount = "Amount is required.";
      if (!formData.categoryId) errors.categoryId = "Category is required.";
      if (!formData.expenseTypeId) errors.expenseTypeId = "Expense type is required.";
      if (!formData.description.trim()) errors.description = "Description is required.";
      if (submitMode) {
        if (!formData.accountName.trim())
          errors.accountName = "Account holder name is required to submit.";
        if (!formData.bankName.trim()) errors.bankName = "Bank or provider is required to submit.";
        if (!formData.accountNumber.trim())
          errors.accountNumber = "Account number is required to submit.";
      }
      return errors;
    };

    const handleSave = async (submitImmediately: boolean) => {
      if (!selectedEntityId) {
        onError("Please select an entity from the header dropdown.");
        return;
      }
      if (!hasDepartment) {
        onError("You must be assigned to a department before submitting expenses.");
        return;
      }

      const errors = validate(submitImmediately);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        onError("Please fill in all required fields.");
        return;
      }
      setFieldErrors({});

      if (submitImmediately && categoryRequiresReceipt && files.length === 0) {
        setAttachmentError("At least one supporting document is required to submit.");
        onError(
          "This category requires at least one supporting document before submitting. You can still save as a draft."
        );
        return;
      }
      setAttachmentError("");

      try {
        let savedExpenseId = expenseId;

        if (expenseId) {
          // Update existing draft
          await updateMutation.mutateAsync({
            id: expenseId,
            data: {
              title: formData.title,
              amount: parseFloat(formData.amount),
              currency: formData.currency,
              expenseDate: formData.expenseDate,
              description: formData.description,
              accountName: formData.accountName,
              accountNumber: formData.accountNumber,
              bankName: formData.bankName,
            },
          });
        } else {
          // Create new expense
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const created: any = await createMutation.mutateAsync({
            entityId: selectedEntityId,
            departmentId: employeeDepartment!.id,
            categoryId: formData.categoryId,
            expenseTypeId: formData.expenseTypeId,
            title: formData.title,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            expenseDate: formData.expenseDate,
            description: formData.description,
            accountName: formData.accountName || undefined,
            accountNumber: formData.accountNumber || undefined,
            bankName: formData.bankName || undefined,
          });
          savedExpenseId = created?.expense?.id || created?.id;
        }

        // Upload new files
        if (savedExpenseId && files.length > 0) {
          for (const file of files) {
            try {
              await uploadExpenseAttachment(savedExpenseId, file);
            } catch (err) {
              console.error("Failed to upload attachment:", err);
            }
          }
        }

        // Submit if requested
        if (submitImmediately && savedExpenseId) {
          await submitMutation.mutateAsync(savedExpenseId);
        }

        onSuccess(savedExpenseId || "", submitImmediately);
      } catch (error) {
        console.error("Failed to save expense:", error);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;
        const apiError = axiosError?.response?.data?.detail || "";
        onError(apiError || "Failed to save expense. Please try again.");
      }
    };

    const handleRestoreDraft = () => {
      const saved = getSavedDraft();
      if (saved) {
        setFormData(saved);
      }
      setShowRestoreBanner(false);
    };

    const handleDismissRestore = () => {
      setShowRestoreBanner(false);
      clearDraft();
    };

    // Expose save method to parent via ref
    useImperativeHandle(ref, () => ({
      handleSave,
      isSaving: createMutation.isPending || updateMutation.isPending,
      isSubmitting: submitMutation.isPending,
      categoryRequiresReceipt,
      attachmentError,
      clearDraft,
    }));

    const calculatePerDiem = async () => {
      if (!perDiemDays || !perDiemDesignation) return;
      try {
        const result = await perDiemMutation.mutateAsync({
          designation: perDiemDesignation,
          days: parseInt(perDiemDays),
        });
        setPerDiemCalculation(result);
        setFormData((prev) => ({ ...prev, amount: String(result.total_amount) }));
      } catch {
        onError("Could not calculate per diem. Please verify the designation.");
      }
    };

    if (!selectedEntityId) {
      return (
        <div className="text-center py-12">
          <Info className="w-12 h-12 mx-auto mb-3 text-text-tertiary" />
          <p className="text-sm text-text-secondary">
            Please select an entity from the header dropdown.
          </p>
        </div>
      );
    }

    if (loadingEmployee || loadingCategories) {
      return (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Restore draft banner */}
        {showRestoreBanner && (
          <div className="flex items-center gap-3 p-3 bg-status-info/10 border border-status-info/20 rounded-lg">
            <RefreshCw className="w-4 h-4 text-status-info shrink-0" />
            <p className="flex-1 text-sm text-text-primary">
              You have an unsaved draft. Would you like to restore it?
            </p>
            <Button variant="outline" size="sm" onClick={handleRestoreDraft}>
              Restore
            </Button>
            <button
              onClick={handleDismissRestore}
              className="p-1 text-text-tertiary hover:text-text-primary"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Expense Type */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Expense Type</h3>
          <LabeledSelect
            label="Type"
            value={formData.expenseTypeId}
            onChange={(e) => setFormData({ ...formData, expenseTypeId: e.target.value })}
            options={[
              { value: "", label: "Select type" },
              ...(typesData?.expense_types || []).map((t) => ({
                value: t.id,
                label: t.name,
              })),
            ]}
            required
          />
        </div>

        {/* Per Diem Calculator */}
        {typesData?.expense_types?.find((t) => t.id === formData.expenseTypeId)?.code ===
          "per_diem" && (
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-status-info" />
              <h3 className="text-sm font-semibold text-text-primary">Per Diem Calculator</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  size="sm"
                  onClick={calculatePerDiem}
                  loading={perDiemMutation.isPending}
                  className="w-full"
                >
                  Calculate
                </Button>
              </div>
            </div>
            {perDiemCalculation && (
              <div className="mt-3 p-3 bg-status-success/10 rounded-lg border border-status-success/20">
                <div className="text-xl font-bold text-status-success">
                  {perDiemCalculation.total_amount.toLocaleString()} RWF
                </div>
                <div className="text-xs text-text-tertiary mt-1">
                  {perDiemCalculation.days} days ×{" "}
                  {perDiemCalculation.rate_per_day.toLocaleString()} RWF/day
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Expense Details */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g., Travel to Kigali"
              required
              error={fieldErrors.title}
            />
            <LabeledSelect
              label="Category"
              value={formData.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              options={[
                { value: "", label: "Select category" },
                ...(categories?.categories || []).map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
              required
              error={fieldErrors.categoryId}
            />
            <Input
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => updateField("amount", e.target.value)}
              placeholder="50000"
              required
              error={fieldErrors.amount}
            />
            <div>
              {hasMultipleCurrencies ? (
                <>
                  <LabeledSelect
                    label="Currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    options={activeCurrencies.map((c) => ({
                      value: c.currency_code,
                      label: `${c.currency_code} - ${c.currency_name}${c.is_default ? " (Default)" : ""}`,
                    }))}
                    required
                  />
                  {showExchangeRate && (
                    <p className="mt-1 text-xs text-text-tertiary">
                      1 {selectedCurrencyInfo!.currency_code} ={" "}
                      {selectedCurrencyInfo!.exchange_rate!.toLocaleString()}{" "}
                      {defaultCurrency!.currency_code}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Currency
                  </label>
                  <div className="h-11 flex items-center px-3 rounded-lg bg-gray-50 border border-gray-200 text-text-primary text-sm">
                    {entityCurrency || "\u2014"}
                  </div>
                  <p className="mt-1 text-xs text-text-tertiary">Set by the selected entity</p>
                </>
              )}
            </div>
            <Input
              label="Expense Date"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Department
              </label>
              {hasDepartment ? (
                <div className="h-11 flex items-center px-3 rounded-lg bg-gray-50 border border-gray-200 text-text-primary text-sm">
                  {employeeDepartment!.name}
                </div>
              ) : (
                <div className="h-11 flex items-center px-3 rounded-lg bg-status-warning/10 border border-status-warning/30 text-status-warning text-sm">
                  No department assigned
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Provide details about this expense..."
                rows={4}
                required
                error={fieldErrors.description}
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Payment Details</h3>
          <div className="flex items-start gap-2 p-3 bg-status-warning/10 border border-status-warning/20 rounded-lg mb-4">
            <AlertTriangle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">Important:</span> The account holder
              name must match the name registered on the bank or mobile money account. Mismatched
              names may cause payment delays or rejection by the bank as a fraud prevention measure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Account Holder Name"
              value={formData.accountName}
              onChange={(e) => updateField("accountName", e.target.value)}
              placeholder="e.g., Jean Uwimana"
              error={fieldErrors.accountName}
            />
            <Input
              label="Bank or Mobile Money Provider"
              value={formData.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
              placeholder="e.g., Bank of Kigali, MTN Mobile Money, Airtel Money"
              error={fieldErrors.bankName}
            />
            <div className="md:col-span-2">
              <Input
                label="Account / Mobile Money Number"
                value={formData.accountNumber}
                onChange={(e) => updateField("accountNumber", e.target.value)}
                placeholder="e.g., 100234567890 or 0788123456"
                error={fieldErrors.accountNumber}
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Enter a bank account number or mobile money phone number. For mobile money, use the
                registered phone number.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
