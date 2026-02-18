"use client";

/**
 * Approval Workflow Configuration Tab
 *
 * Admin tab for managing approval workflows and their steps.
 * Supports creating, editing, and deactivating workflows.
 * Steps can be designated as REQUEST or FINANCE chain.
 */

import { useState } from "react";
import { Button, Card, Badge, Spinner, ResultModal } from "@/src/components/ui";
import type { ResultModalVariant } from "@/src/components/ui/ResultModal";
import { useAuth } from "@/src/lib/auth";
import {
  useApprovalWorkflows,
  useCreateApprovalWorkflow,
  useUpdateApprovalWorkflow,
  useDeleteApprovalWorkflow,
  useDepartments,
} from "@/src/hooks/useExpenses";
import type { ApprovalWorkflow, ApprovalWorkflowStep } from "@/src/lib/api/expenseClient";

export function WorkflowsTab() {
  const { selectedEntityId } = useAuth();
  const { data: workflows, isLoading, error } = useApprovalWorkflows(selectedEntityId || undefined);
  const { data: deptData } = useDepartments(selectedEntityId || undefined);
  const createWorkflow = useCreateApprovalWorkflow();
  const updateWorkflow = useUpdateApprovalWorkflow();
  const deleteWorkflow = useDeleteApprovalWorkflow();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    expense_type: "",
    department_id: "",
    min_amount: "",
    max_amount: "",
    priority: "0",
    steps: [] as Array<{
      step_order: number;
      approver_role: string;
      chain: string;
      is_required: boolean;
      fallback_to_hierarchy: boolean;
    }>,
  });
  const [resultModal, setResultModal] = useState<{
    isOpen: boolean;
    variant: ResultModalVariant;
    title: string;
    message: string;
    secondaryMessage?: string;
  }>({ isOpen: false, variant: "info", title: "", message: "" });

  const showResultModal = (
    variant: ResultModalVariant,
    title: string,
    message: string,
    secondaryMessage?: string
  ) => {
    setResultModal({ isOpen: true, variant, title, message, secondaryMessage });
  };

  const closeResultModal = () => {
    setResultModal((prev) => ({ ...prev, isOpen: false }));
  };

  const departments = deptData?.departments || [];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      expense_type: "",
      department_id: "",
      min_amount: "",
      max_amount: "",
      priority: "0",
      steps: [],
    });
    setEditingWorkflow(null);
    setShowCreateForm(false);
  };

  const addStep = (chain: string = "request") => {
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          step_order: prev.steps.length + 1,
          approver_role: "",
          chain,
          is_required: true,
          fallback_to_hierarchy: false,
        },
      ],
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_order: i + 1 })),
    }));
  };

  const updateStep = (index: number, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEntityId) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        expense_type: formData.expense_type || undefined,
        department_id: formData.department_id || undefined,
        min_amount: formData.min_amount ? parseFloat(formData.min_amount) : undefined,
        max_amount: formData.max_amount ? parseFloat(formData.max_amount) : undefined,
        priority: parseInt(formData.priority) || 0,
        steps: formData.steps.length > 0 ? formData.steps : undefined,
      };

      if (editingWorkflow) {
        await updateWorkflow.mutateAsync({
          workflowId: editingWorkflow,
          data: payload,
        });
        showResultModal(
          "success",
          "Workflow Updated",
          `The approval workflow "${formData.name}" has been updated successfully.`
        );
      } else {
        await createWorkflow.mutateAsync({
          entityId: selectedEntityId,
          data: payload,
        });
        showResultModal(
          "success",
          "Workflow Created",
          `The approval workflow "${formData.name}" has been created successfully.`,
          formData.steps.length > 0
            ? `${formData.steps.length} approval step(s) configured.`
            : "No approval steps were added. You can edit this workflow to add steps later."
        );
      }
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save workflow";
      showResultModal(
        "error",
        editingWorkflow ? "Update Failed" : "Creation Failed",
        message,
        "Please check your input and try again."
      );
    }
  };

  const handleEdit = (workflow: ApprovalWorkflow) => {
    setFormData({
      name: workflow.name,
      description: workflow.description || "",
      expense_type: workflow.expense_type || "",
      department_id: workflow.department_id || "",
      min_amount: workflow.min_amount?.toString() || "",
      max_amount: workflow.max_amount?.toString() || "",
      priority: workflow.priority.toString(),
      steps: workflow.steps.map((s) => ({
        step_order: s.step_order,
        approver_role: s.approver_role,
        chain: s.chain || "request",
        is_required: s.is_required,
        fallback_to_hierarchy: s.fallback_to_hierarchy,
      })),
    });
    setEditingWorkflow(workflow.id);
    setShowCreateForm(true);
  };

  const handleDeactivate = async (workflowId: string) => {
    if (!confirm("Are you sure you want to deactivate this workflow?")) return;

    try {
      await deleteWorkflow.mutateAsync(workflowId);
      showResultModal(
        "success",
        "Workflow Deactivated",
        "The approval workflow has been deactivated.",
        "It will no longer be used for new expense submissions."
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to deactivate workflow";
      showResultModal("error", "Deactivation Failed", message);
    }
  };

  if (isLoading) return <Spinner centered label="Loading workflows..." />;

  if (error) {
    return (
      <Card variant="bordered">
        <div className="text-center text-error py-8">
          Failed to load approval workflows. Please try again.
        </div>
      </Card>
    );
  }

  const workflowList = Array.isArray(workflows) ? workflows : [];

  return (
    <div className="space-y-6">
      <ResultModal
        isOpen={resultModal.isOpen}
        variant={resultModal.variant}
        title={resultModal.title}
        message={resultModal.message}
        secondaryMessage={resultModal.secondaryMessage}
        actionLabel="OK"
        onAction={closeResultModal}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Approval Workflows</h3>
          <p className="text-sm text-text-secondary mt-1">
            Configure multi-step approval chains for expense requests
          </p>
        </div>
        <Button
          variant={showCreateForm ? "outline" : "primary"}
          size="sm"
          onClick={() => {
            if (showCreateForm) resetForm();
            else setShowCreateForm(true);
          }}
        >
          {showCreateForm ? "Cancel" : "Create Workflow"}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="lg">
          <h4 className="font-semibold text-text-primary mb-4">
            {editingWorkflow ? "Edit Workflow" : "Create New Workflow"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Expense Type
                </label>
                <select
                  value={formData.expense_type}
                  onChange={(e) => setFormData((p) => ({ ...p, expense_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
                >
                  <option value="">All Types</option>
                  <option value="expense">Expense</option>
                  <option value="per_diem">Per Diem</option>
                  <option value="advance">Advance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Department
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData((p) => ({ ...p, department_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
                >
                  <option value="">All Departments</option>
                  {departments.map((d: { id: string; name: string }) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData((p) => ({ ...p, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData((p) => ({ ...p, min_amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
                  placeholder="No minimum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => setFormData((p) => ({ ...p, max_amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
                  placeholder="No maximum"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 border border-border-light rounded-lg text-sm"
                rows={2}
              />
            </div>

            {/* Steps */}
            <div className="border-t border-border-light pt-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-text-primary">Approval Steps</h5>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStep("request")}
                  >
                    + Request Step
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addStep("finance")}
                  >
                    + Finance Step
                  </Button>
                </div>
              </div>
              {formData.steps.length === 0 && (
                <p className="text-sm text-text-secondary italic">
                  No steps added yet. Add request and/or finance chain steps.
                </p>
              )}
              <div className="space-y-3">
                {formData.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      step.chain === "finance"
                        ? "border-blue-200 bg-blue-50"
                        : "border-border-light bg-background-light"
                    }`}
                  >
                    <span className="text-sm font-medium text-text-secondary w-8">
                      #{step.step_order}
                    </span>
                    <Badge variant={step.chain === "finance" ? "info" : "default"} size="sm">
                      {step.chain.toUpperCase()}
                    </Badge>
                    <input
                      type="text"
                      value={step.approver_role}
                      onChange={(e) => updateStep(idx, "approver_role", e.target.value)}
                      placeholder="Approver role (e.g., manager, finance_director)"
                      className="flex-1 px-3 py-1.5 border border-border-light rounded text-sm"
                    />
                    <label className="flex items-center gap-1 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={step.is_required}
                        onChange={(e) => updateStep(idx, "is_required", e.target.checked)}
                      />
                      Required
                    </label>
                    <label className="flex items-center gap-1 text-xs text-text-secondary">
                      <input
                        type="checkbox"
                        checked={step.fallback_to_hierarchy}
                        onChange={(e) => updateStep(idx, "fallback_to_hierarchy", e.target.checked)}
                      />
                      Fallback
                    </label>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-error hover:text-error/80 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={createWorkflow.isPending || updateWorkflow.isPending}
              >
                {editingWorkflow ? "Update Workflow" : "Create Workflow"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Workflow List */}
      {workflowList.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-8 text-text-secondary">
            No approval workflows configured yet. Create one to get started.
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {workflowList.map((workflow: ApprovalWorkflow) => (
            <Card key={workflow.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-text-primary">{workflow.name}</h4>
                    <Badge variant={workflow.is_active ? "success" : "warning"} size="sm">
                      {workflow.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {workflow.expense_type && (
                      <Badge variant="default" size="sm">
                        {workflow.expense_type}
                      </Badge>
                    )}
                  </div>
                  {workflow.description && (
                    <p className="text-sm text-text-secondary mb-2">{workflow.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                    {workflow.department_name && <span>Dept: {workflow.department_name}</span>}
                    {workflow.min_amount != null && <span>Min: {workflow.min_amount}</span>}
                    {workflow.max_amount != null && <span>Max: {workflow.max_amount}</span>}
                    <span>Priority: {workflow.priority}</span>
                  </div>
                  {/* Steps */}
                  {workflow.steps && workflow.steps.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {workflow.steps.map((step: ApprovalWorkflowStep) => (
                        <div
                          key={step.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            step.chain === "finance"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}
                        >
                          <span className="font-medium">#{step.step_order}</span>
                          <span>{step.approver_role}</span>
                          <span className="opacity-60">({step.chain})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(workflow)}>
                    Edit
                  </Button>
                  {workflow.is_active && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeactivate(workflow.id)}
                      loading={deleteWorkflow.isPending}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
