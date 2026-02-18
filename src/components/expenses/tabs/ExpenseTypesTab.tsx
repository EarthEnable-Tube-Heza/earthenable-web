"use client";

/**
 * Expense Types Tab (Admin Only)
 *
 * Manage configurable expense types per entity
 */

import { useState } from "react";
import { Input, Button, Card, Spinner, Badge, Toast } from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import { Plus, XCircle, Save, Tag, Info } from "@/src/lib/icons";
import {
  useExpenseTypesAdmin,
  useCreateExpenseType,
  useUpdateExpenseType,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import type { ExpenseTypeConfig } from "@/src/lib/api/expenseClient";

export function ExpenseTypesTab() {
  const { selectedEntityId } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    type: "success" as ToastType,
    message: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
    displayOrder: 0,
  });

  const { data, isLoading } = useExpenseTypesAdmin(selectedEntityId || undefined);
  const createType = useCreateExpenseType(selectedEntityId || undefined);
  const updateType = useUpdateExpenseType(selectedEntityId || undefined);

  const expenseTypes = data?.expense_types || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createType.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
      });

      setToast({
        visible: true,
        type: "success",
        message: "Expense type created successfully!",
      });
      setShowCreateForm(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        isActive: true,
        displayOrder: 0,
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to create expense type. Please try again.",
      });
      console.error(error);
    }
  };

  const handleToggleActive = async (typeItem: ExpenseTypeConfig, newActive: boolean) => {
    try {
      await updateType.mutateAsync({
        typeId: typeItem.id,
        data: { isActive: newActive },
      });
      setToast({
        visible: true,
        type: "success",
        message: `Expense type "${typeItem.name}" ${newActive ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to update expense type.",
      });
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Expense Types</h3>
          <p className="text-sm text-text-secondary">
            Manage expense types available in the create expense dropdown
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={!selectedEntityId}
        >
          {showCreateForm ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Type
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">About Expense Types</h4>
            <p className="text-sm text-text-secondary">
              Expense types classify the nature of an expense (e.g., Regular Expense, Per Diem,
              Advance Payment). The <strong>code</strong> field is a stable identifier used by the
              system — for example, the per diem calculator is shown when the type code is
              &quot;per_diem&quot;. Deactivated types will no longer appear in the create expense
              dropdown.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Type Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Create New Expense Type</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Type Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Regular Expense, Per Diem"
                  required
                />

                <Input
                  label="Type Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., expense, per_diem, advance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of this expense type"
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Display Order"
                  type="number"
                  value={String(formData.displayOrder)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />

                <div className="flex items-end">
                  <div className="flex items-center gap-3 pb-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-border-default"
                    />
                    <label htmlFor="isActive" className="text-sm text-text-primary">
                      Type is active
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={createType.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Type
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Types List */}
      {!selectedEntityId ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Info className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No entity selected</h3>
            <p className="text-text-secondary">
              Please select an entity from the header to view and manage expense types.
            </p>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : expenseTypes.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No expense types configured
            </h3>
            <p className="text-text-secondary mb-4">
              Create your first expense type to classify expenses.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Type
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseTypes.map((typeItem: ExpenseTypeConfig) => (
            <Card key={typeItem.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text-primary">{typeItem.name}</h3>
                    <p className="text-sm text-text-secondary">{typeItem.code}</p>
                  </div>
                </div>
                {typeItem.is_active ? (
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    Inactive
                  </Badge>
                )}
              </div>

              {typeItem.description && (
                <p className="text-sm text-text-secondary mb-3">{typeItem.description}</p>
              )}

              <div className="bg-background-light p-3 rounded-lg mb-3 space-y-1">
                <div className="text-sm">
                  <span className="text-text-secondary">Display Order:</span>{" "}
                  <span className="font-medium text-text-primary">{typeItem.display_order}</span>
                </div>
              </div>

              <div className="text-xs text-text-tertiary mb-3">
                Created: {new Date(typeItem.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button
                  variant={typeItem.is_active ? "outline" : "primary"}
                  size="sm"
                  onClick={() => handleToggleActive(typeItem, !typeItem.is_active)}
                  loading={updateType.isPending}
                >
                  {typeItem.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
