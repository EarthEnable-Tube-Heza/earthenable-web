"use client";

/**
 * Role Editor Component
 *
 * Modal dialog for creating and editing permission roles.
 * Includes name, description, entity selection, and permission tree.
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { Button, Input, Textarea, Spinner, LabeledSelect } from "@/src/components/ui";
import { PermissionTree } from "./PermissionTree";
import type {
  CreatePermissionRoleRequest,
  UpdatePermissionRoleRequest,
} from "@/src/types/permission";

interface PermissionSelection {
  permission_key: string;
  access_level: "full" | "read_only" | "none";
}

interface RoleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  roleId?: string; // If provided, edit mode; otherwise, create mode
  onSuccess?: () => void;
}

export function RoleEditor({ isOpen, onClose, roleId, onSuccess }: RoleEditorProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!roleId;

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [entityId, setEntityId] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionSelection[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch permission definitions
  const { data: permissionDefs, isLoading: loadingDefs } = useQuery({
    queryKey: ["permission-definitions"],
    queryFn: () => apiClient.getPermissionDefinitions(),
    enabled: isOpen,
  });

  // Fetch entities for entity selector
  const { data: entities } = useQuery({
    queryKey: ["entities-for-admin"],
    queryFn: () => apiClient.getEntitiesForAdmin(),
    enabled: isOpen,
  });

  // Fetch role details if editing
  const { data: roleData, isLoading: loadingRole } = useQuery({
    queryKey: ["permission-role", roleId],
    queryFn: () => apiClient.getPermissionRole(roleId!),
    enabled: isOpen && isEditMode,
  });

  // Populate form when editing
  useEffect(() => {
    if (roleData) {
      setName(roleData.name);
      setDescription(roleData.description || "");
      setEntityId(roleData.entity_id || "");
      setSelectedPermissions(
        roleData.permissions.map((p) => ({
          permission_key: p.permission_key,
          access_level: p.access_level,
        }))
      );
    }
  }, [roleData]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setEntityId("");
      setSelectedPermissions([]);
      setErrors({});
    }
  }, [isOpen]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionRoleRequest) => apiClient.createPermissionRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-roles"] });
      onSuccess?.();
      onClose();
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message || "Failed to create role" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: {
      role: UpdatePermissionRoleRequest;
      permissions: PermissionSelection[];
    }) => {
      // First update the role
      await apiClient.updatePermissionRole(roleId!, data.role);
      // Then set permissions
      await apiClient.setRolePermissions(roleId!, {
        permissions: data.permissions,
      });
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-roles"] });
      queryClient.invalidateQueries({ queryKey: ["permission-role", roleId] });
      onSuccess?.();
      onClose();
    },
    onError: (error: Error) => {
      setErrors({ submit: error.message || "Failed to update role" });
    },
  });

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (selectedPermissions.length === 0) {
      newErrors.permissions = "At least one permission must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, selectedPermissions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditMode) {
      updateMutation.mutate({
        role: {
          name: name.trim(),
          description: description.trim() || undefined,
        },
        permissions: selectedPermissions,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        entity_id: entityId || undefined,
        permissions: selectedPermissions,
      });
    }
  };

  const isLoading = loadingDefs || (isEditMode && loadingRole);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {isEditMode ? "Edit Permission Role" : "Create Permission Role"}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            disabled={isSaving}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <>
                {/* Name */}
                <Input
                  label="Role Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Call Center Officer"
                  error={errors.name}
                  required
                  disabled={isSaving || (roleData?.is_system_role && isEditMode)}
                />

                {/* Description */}
                <Textarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this role is for..."
                  rows={2}
                  disabled={isSaving}
                />

                {/* Entity Selector (only for create mode) */}
                {!isEditMode && entities && entities.length > 0 && (
                  <div>
                    <LabeledSelect
                      label="Entity (Optional)"
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      disabled={isSaving}
                      options={[
                        { value: "", label: "Global (All Entities)" },
                        ...entities.map((entity) => ({
                          value: entity.id,
                          label: `${entity.name} (${entity.code})`,
                        })),
                      ]}
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      If set, this role will only be assignable to users in this entity.
                    </p>
                  </div>
                )}

                {/* Entity display for edit mode */}
                {isEditMode && roleData?.entity && (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Entity
                    </label>
                    <div className="px-4 py-2 bg-background-light rounded-md text-text-secondary">
                      {roleData.entity.name} ({roleData.entity.code})
                    </div>
                  </div>
                )}

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Permissions <span className="text-status-error">*</span>
                  </label>
                  {permissionDefs && (
                    <PermissionTree
                      permissions={permissionDefs.permissions}
                      selectedPermissions={selectedPermissions}
                      onChange={setSelectedPermissions}
                      disabled={isSaving}
                    />
                  )}
                  {errors.permissions && (
                    <p className="text-xs text-status-error mt-1">{errors.permissions}</p>
                  )}
                </div>

                {/* System role warning */}
                {roleData?.is_system_role && (
                  <div className="bg-status-warning/10 border border-status-warning/30 rounded-md p-3">
                    <p className="text-sm text-status-warning">
                      This is a system role. The name cannot be changed, but you can modify the
                      permissions.
                    </p>
                  </div>
                )}

                {/* Error message */}
                {errors.submit && (
                  <div className="bg-status-error/10 border border-status-error/30 rounded-md p-3">
                    <p className="text-sm text-status-error">{errors.submit}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSaving} disabled={isLoading}>
              {isEditMode ? "Save Changes" : "Create Role"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
