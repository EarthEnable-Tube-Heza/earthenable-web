"use client";

/**
 * Categories Tab (Admin Only)
 *
 * Expense category management with GL code configuration
 */

import { useState } from "react";
import { Input, Button, Card, Spinner, Badge } from "@/src/components/ui";
import { Plus, XCircle, Save, Tag, Edit, Info } from "@/src/lib/icons";
import { useExpenseCategories, useCreateExpenseCategory } from "@/src/hooks/useExpenses";
import type { ExpenseCategory } from "@/src/lib/api/expenseClient";

export function CategoriesTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    requiresReceipt: true,
    isActive: true,
    glCode: "",
    glClassId: "",
  });

  const { data, isLoading } = useExpenseCategories();
  const createCategory = useCreateExpenseCategory();

  const categories = data?.categories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCategory.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        requiresReceipt: formData.requiresReceipt,
        isActive: formData.isActive,
        glCode: formData.glCode || undefined,
        glClassId: formData.glClassId || undefined,
      });

      alert("Expense category created successfully!");
      setShowCreateForm(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        requiresReceipt: true,
        isActive: true,
        glCode: "",
        glClassId: "",
      });
    } catch (error) {
      alert("Failed to create expense category. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Expense Categories</h3>
          <p className="text-sm text-text-secondary">
            Manage expense categories with accounting integration
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
              Create Category
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">About Expense Categories</h4>
            <p className="text-sm text-text-secondary">
              Expense categories classify different types of expenses (e.g., Travel, Meals,
              Supplies). Each category can have GL codes for accounting integration and specify
              whether receipts are required.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Category Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Create New Category</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Category Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Travel, Meals, Office Supplies"
                  required
                />

                <Input
                  label="Category Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., TRVL, MEAL, SUPP"
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
                  placeholder="Optional description of this category"
                  className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
            </div>

            {/* Accounting Integration */}
            <div className="space-y-4 pt-4 border-t border-border-light">
              <h4 className="font-medium text-text-primary">Accounting Integration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="GL Code"
                  value={formData.glCode}
                  onChange={(e) => setFormData({ ...formData, glCode: e.target.value })}
                  placeholder="e.g., 5100, 6200 (Optional)"
                />

                <Input
                  label="GL Class ID"
                  value={formData.glClassId}
                  onChange={(e) => setFormData({ ...formData, glClassId: e.target.value })}
                  placeholder="QuickBooks Class ID (Optional)"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requiresReceipt"
                    checked={formData.requiresReceipt}
                    onChange={(e) =>
                      setFormData({ ...formData, requiresReceipt: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-border-default"
                  />
                  <label htmlFor="requiresReceipt" className="text-sm text-text-primary">
                    Require receipt for expenses in this category
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-border-default"
                  />
                  <label htmlFor="isActive" className="text-sm text-text-primary">
                    Category is active
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={createCategory.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Category
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : categories.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No expense categories configured
            </h3>
            <p className="text-text-secondary mb-4">
              Create your first expense category to classify expenses.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Category
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: ExpenseCategory) => (
            <Card key={category.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text-primary">{category.name}</h3>
                    <p className="text-sm text-text-secondary">{category.code}</p>
                  </div>
                </div>
                {category.is_active ? (
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    Inactive
                  </Badge>
                )}
              </div>

              {category.description && (
                <p className="text-sm text-text-secondary mb-3">{category.description}</p>
              )}

              {/* Receipt Requirement */}
              {category.requires_receipt && (
                <div className="mb-3">
                  <Badge variant="warning" size="sm">
                    Receipt Required
                  </Badge>
                </div>
              )}

              {/* GL Codes */}
              {(category.gl_code || category.gl_class_id) && (
                <div className="bg-background-light p-3 rounded-lg mb-3 space-y-1">
                  {category.gl_code && (
                    <div className="text-sm">
                      <span className="text-text-secondary">GL Code:</span>{" "}
                      <span className="font-medium text-text-primary">{category.gl_code}</span>
                    </div>
                  )}
                  {category.gl_class_id && (
                    <div className="text-sm">
                      <span className="text-text-secondary">GL Class ID:</span>{" "}
                      <span className="font-medium text-text-primary">{category.gl_class_id}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-text-tertiary mb-3">
                Created: {new Date(category.created_at).toLocaleDateString()}
              </div>

              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
