"use client";

/**
 * Job Roles Tab (Admin Only)
 *
 * Job role management with seniority levels and entity-specific roles
 */

import { useState } from "react";
import { Input, Button, LabeledSelect, Card, Spinner, Badge, Toast } from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import { Plus, XCircle, Save, Info, Briefcase } from "@/src/lib/icons";
import { useJobRoles, useCreateJobRole, useSeniorityLevels } from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";

const getSeniorityBadgeVariant = (rank: number): "info" | "success" | "warning" | "error" => {
  if (rank >= 6) return "error";
  if (rank >= 4) return "warning";
  if (rank >= 2) return "info";
  return "success";
};

export function JobRolesTab() {
  const { selectedEntityId } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success" as ToastType, message: "" });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    seniority_level_id: "",
    description: "",
    isActive: true,
  });

  const { data, isLoading } = useJobRoles(selectedEntityId || undefined);
  const createJobRole = useCreateJobRole(selectedEntityId || undefined);
  const { data: seniorityLevels = [] } = useSeniorityLevels(selectedEntityId || undefined);

  const jobRoles = data?.job_roles || [];

  // Build options from fetched seniority levels
  const seniorityOptions = seniorityLevels.map((sl) => ({
    value: sl.id,
    label: sl.name,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createJobRole.mutateAsync({
        name: formData.name,
        code: formData.code,
        seniority_level_id: formData.seniority_level_id || undefined,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });

      setToast({ visible: true, type: "success", message: "Job role created successfully!" });
      setShowCreateForm(false);
      setFormData({
        name: "",
        code: "",
        seniority_level_id: "",
        description: "",
        isActive: true,
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to create job role. Please try again.",
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
          <h3 className="text-lg font-semibold text-text-primary">Job Roles</h3>
          <p className="text-sm text-text-secondary">
            Manage organizational job roles with seniority levels for employee assignments
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
              Create Job Role
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">How Job Roles Work</h4>
            <p className="text-sm text-text-secondary">
              Job roles represent specific positions within your organization (e.g., &quot;Systems
              Officer&quot;, &quot;QA Manager&quot;, &quot;Sales Director&quot;). Each role can
              optionally be assigned a seniority level that determines hierarchy. These roles are
              separate from system permission roles (admin, manager, qa_agent) and are used for
              organizational structure and employee management.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showCreateForm && selectedEntityId && (
        <Card variant="elevated" padding="lg" divided>
          <h4 className="text-base font-semibold text-text-primary mb-4">Create New Job Role</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Role Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Systems Officer"
                required
              />
              <Input
                label="Role Code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SYS_OFF"
                required
              />
            </div>

            <LabeledSelect
              label="Seniority Level"
              value={formData.seniority_level_id}
              onChange={(e) => setFormData({ ...formData, seniority_level_id: e.target.value })}
              options={[
                { value: "", label: "Select seniority level (optional)" },
                ...seniorityOptions,
              ]}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe the responsibilities and requirements for this role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm text-text-secondary">
                Active (role can be assigned to employees)
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({
                    name: "",
                    code: "",
                    seniority_level_id: "",
                    description: "",
                    isActive: true,
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={createJobRole.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Job Role
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Job Roles List */}
      {!selectedEntityId ? (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">
              Please select an entity from the header to view and manage job roles
            </p>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" variant="primary" />
        </div>
      ) : jobRoles.length === 0 ? (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary mb-2">No job roles found for this entity</p>
            <p className="text-sm text-text-tertiary">
              Create your first job role to start organizing your workforce
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobRoles.map((role) => (
            <Card key={role.id} variant="bordered" padding="md" hoverable>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-text-primary">{role.name}</h5>
                      {!role.is_active && (
                        <Badge variant="error" size="sm">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary font-mono">{role.code}</p>
                  </div>
                  <Briefcase className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                </div>

                {role.seniority_level_name && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getSeniorityBadgeVariant(
                        seniorityLevels.find((sl) => sl.id === role.seniority_level_id)?.rank ?? 0
                      )}
                      size="sm"
                    >
                      {role.seniority_level_name}
                    </Badge>
                  </div>
                )}

                {role.description && (
                  <p className="text-xs text-text-secondary line-clamp-2">{role.description}</p>
                )}

                <div className="pt-2 border-t border-border-light">
                  <p className="text-xs text-text-tertiary">
                    Created {new Date(role.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
