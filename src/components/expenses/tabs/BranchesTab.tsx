"use client";

/**
 * Branches Tab (Admin Only)
 *
 * Branch management with GL code configuration
 */

import { useState } from "react";
import { Input, Button, Card, Spinner, Badge, Toast } from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import { Plus, XCircle, Save, MapPin, Edit, Info } from "@/src/lib/icons";
import { useBranches, useCreateBranch } from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";
import type { Branch } from "@/src/lib/api/expenseClient";

export function BranchesTab() {
  const { selectedEntityId } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success" as ToastType, message: "" });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    isActive: true,
    glCode: "",
    glClassId: "",
  });

  const { data, isLoading } = useBranches(selectedEntityId || undefined);
  const createBranch = useCreateBranch(selectedEntityId || undefined);

  const branches = data?.branches || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createBranch.mutateAsync({
        name: formData.name,
        code: formData.code,
        location: formData.location || undefined,
        isActive: formData.isActive,
        glCode: formData.glCode || undefined,
        glClassId: formData.glClassId || undefined,
      });

      setToast({ visible: true, type: "success", message: "Branch created successfully!" });
      setShowCreateForm(false);
      setFormData({
        name: "",
        code: "",
        location: "",
        isActive: true,
        glCode: "",
        glClassId: "",
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to create branch. Please try again.",
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
          <h3 className="text-lg font-semibold text-text-primary">Branches</h3>
          <p className="text-sm text-text-secondary">
            Manage physical branch locations with accounting integration
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
              Create Branch
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">About Branches</h4>
            <p className="text-sm text-text-secondary">
              Branches represent physical locations within an entity. Each branch can have GL codes
              for accounting integration and QuickBooks class mapping.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Branch Form */}
      {showCreateForm && (
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Create New Branch</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-text-primary">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Branch Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Kigali Office, Nairobi Branch"
                  required
                />

                <Input
                  label="Branch Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., KGL, NBO, DAR"
                  required
                />

                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Kigali, Kenya, Tanzania (Optional)"
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
                  placeholder="e.g., 5000, 6100 (Optional)"
                />

                <Input
                  label="GL Class ID"
                  value={formData.glClassId}
                  onChange={(e) => setFormData({ ...formData, glClassId: e.target.value })}
                  placeholder="QuickBooks Class ID (Optional)"
                />
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
                  Branch is active
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={createBranch.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Branch
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Branches List */}
      {!selectedEntityId ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <Info className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No entity selected</h3>
            <p className="text-text-secondary">
              Please select an entity from the header to view and manage branches.
            </p>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : branches.length === 0 ? (
        <Card variant="bordered">
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No branches configured</h3>
            <p className="text-text-secondary mb-4">
              Create your first branch to organize expense tracking by location.
            </p>
            {!showCreateForm && (
              <Button variant="primary" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Branch
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch: Branch) => (
            <Card key={branch.id} variant="bordered" padding="md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-text-primary">{branch.name}</h3>
                    <p className="text-sm text-text-secondary">{branch.code}</p>
                  </div>
                </div>
                {branch.is_active ? (
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    Inactive
                  </Badge>
                )}
              </div>

              {branch.location && (
                <div className="text-sm text-text-secondary mb-3">📍 {branch.location}</div>
              )}

              {/* GL Codes */}
              {(branch.gl_code || branch.gl_class_id) && (
                <div className="bg-background-light p-3 rounded-lg mb-3 space-y-1">
                  {branch.gl_code && (
                    <div className="text-sm">
                      <span className="text-text-secondary">GL Code:</span>{" "}
                      <span className="font-medium text-text-primary">{branch.gl_code}</span>
                    </div>
                  )}
                  {branch.gl_class_id && (
                    <div className="text-sm">
                      <span className="text-text-secondary">GL Class ID:</span>{" "}
                      <span className="font-medium text-text-primary">{branch.gl_class_id}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-text-tertiary mb-3">
                Created: {new Date(branch.created_at).toLocaleDateString()}
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
