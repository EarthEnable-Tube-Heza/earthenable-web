"use client";

/**
 * Job Roles Tab (Admin Only)
 *
 * Job role management with organizational levels and entity-specific roles
 */

import { useState } from "react";
import {
  Input,
  Button,
  LabeledSelect,
  Card,
  Spinner,
  Badge,
  Select,
  Toast,
} from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import { Plus, XCircle, Save, Info, Briefcase } from "@/src/lib/icons";
import { useJobRoles, useCreateJobRole, useEntities } from "@/src/hooks/useExpenses";

const LEVEL_OPTIONS = [
  { value: "intern", label: "Intern" },
  { value: "officer", label: "Officer" },
  { value: "junior_manager", label: "Junior Manager" },
  { value: "manager", label: "Manager" },
  { value: "senior_manager", label: "Senior Manager" },
  { value: "director", label: "Director" },
  { value: "c_suite", label: "C-Suite" },
];

const getLevelLabel = (level: string): string => {
  const option = LEVEL_OPTIONS.find((opt) => opt.value === level);
  return option?.label || level;
};

const getLevelBadgeVariant = (level: string): "info" | "success" | "warning" | "error" => {
  if (level === "c_suite" || level === "director") return "error";
  if (level === "senior_manager" || level === "manager") return "warning";
  if (level === "junior_manager" || level === "officer") return "info";
  return "success";
};

export function JobRolesTab() {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "success" as ToastType, message: "" });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    level: "officer",
    description: "",
    isActive: true,
  });

  const { data: entitiesData, isLoading: entitiesLoading } = useEntities();
  const { data, isLoading } = useJobRoles(selectedEntityId);
  const createJobRole = useCreateJobRole(selectedEntityId);

  const entities = entitiesData?.entities || [];
  const jobRoles = data?.job_roles || [];

  // Auto-select first entity if none selected
  if (!selectedEntityId && entities.length > 0 && !entitiesLoading) {
    setSelectedEntityId(entities[0].id);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createJobRole.mutateAsync({
        name: formData.name,
        code: formData.code,
        level: formData.level,
        description: formData.description || undefined,
        isActive: formData.isActive,
      });

      setToast({ visible: true, type: "success", message: "Job role created successfully!" });
      setShowCreateForm(false);
      setFormData({
        name: "",
        code: "",
        level: "officer",
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

      {/* Entity Selection */}
      <Card variant="bordered" padding="md">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-text-primary whitespace-nowrap">
            Select Entity:
          </label>
          <Select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            disabled={entitiesLoading || entities.length === 0}
            className="flex-1 max-w-md"
          >
            <option value="">Select an entity...</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name} ({entity.code})
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Job Roles</h3>
          <p className="text-sm text-text-secondary">
            Manage organizational job roles with levels for employee assignments
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
              Officer&quot;, &quot;QA Manager&quot;, &quot;Sales Director&quot;). Each role is
              assigned an organizational level that determines hierarchy. These roles are separate
              from system permission roles (admin, manager, qa_agent) and are used for
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
              label="Organizational Level"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              options={LEVEL_OPTIONS}
              required
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
                    level: "officer",
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
              Please select an entity to view and manage job roles
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

                <div className="flex items-center gap-2">
                  <Badge variant={getLevelBadgeVariant(role.level)} size="sm">
                    {getLevelLabel(role.level)}
                  </Badge>
                </div>

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
