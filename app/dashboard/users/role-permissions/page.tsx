"use client";

/**
 * Role Permission Mappings Page
 *
 * Admin page for managing Salesforce role to permission tier mappings.
 * Allows CRUD operations on role-permission mappings that determine
 * what tasks users can see based on their Salesforce position title.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api/apiClient";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PAGE_SPACING } from "@/src/lib/theme";
import { Button, Card, Badge, Spinner, Input, Select } from "@/src/components/ui";
import {
  RolePermissionMapping,
  CreateRolePermissionMappingRequest,
  UpdateRolePermissionMappingRequest,
  PermissionTierInfo,
} from "@/src/types";

// Permission tier colors for badges
const TIER_COLORS: Record<string, "default" | "warning" | "success"> = {
  view_own: "default",
  view_team: "warning",
  view_all: "success",
};

const TIER_LABELS: Record<string, string> = {
  view_own: "View Own",
  view_team: "View Team",
  view_all: "View All",
};

export default function RolePermissionsPage() {
  useSetPageHeader({
    title: "Role Permissions",
    pathLabels: { users: "Users", "role-permissions": "Role Permissions" },
  });

  const queryClient = useQueryClient();

  // State for filters
  const [tierFilter, setTierFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMapping, setEditingMapping] = useState<RolePermissionMapping | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<RolePermissionMapping | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateRolePermissionMappingRequest>({
    salesforce_role: "",
    display_name: "",
    permission_tier: "view_own",
    description: "",
  });
  const [formError, setFormError] = useState("");

  // Fetch permission tiers
  const { data: tiersData } = useQuery({
    queryKey: ["permissionTiers"],
    queryFn: () => apiClient.getPermissionTiers(),
  });

  // Fetch role permission mappings
  const {
    data: mappingsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rolePermissionMappings", tierFilter, statusFilter, searchQuery],
    queryFn: () =>
      apiClient.getRolePermissionMappings({
        permission_tier: tierFilter || undefined,
        is_active: statusFilter === "" ? undefined : statusFilter === "active",
        search: searchQuery || undefined,
      }),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateRolePermissionMappingRequest) =>
      apiClient.createRolePermissionMapping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissionMappings"] });
      setShowCreateModal(false);
      resetForm();
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to create mapping");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRolePermissionMappingRequest }) =>
      apiClient.updateRolePermissionMapping(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissionMappings"] });
      setEditingMapping(null);
      resetForm();
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to update mapping");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteRolePermissionMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissionMappings"] });
      setDeleteConfirm(null);
    },
  });

  const resetForm = () => {
    setFormData({
      salesforce_role: "",
      display_name: "",
      permission_tier: "view_own",
      description: "",
    });
    setFormError("");
  };

  const handleCreate = () => {
    if (!formData.salesforce_role.trim() || !formData.display_name.trim()) {
      setFormError("Role name and display name are required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingMapping) return;
    updateMutation.mutate({
      id: editingMapping.id,
      data: {
        display_name: formData.display_name,
        permission_tier: formData.permission_tier,
        description: formData.description,
        is_active: editingMapping.is_active,
      },
    });
  };

  const openEditModal = (mapping: RolePermissionMapping) => {
    setEditingMapping(mapping);
    setFormData({
      salesforce_role: mapping.salesforce_role,
      display_name: mapping.display_name,
      permission_tier: mapping.permission_tier,
      description: mapping.description || "",
    });
    setFormError("");
  };

  const toggleMappingStatus = (mapping: RolePermissionMapping) => {
    updateMutation.mutate({
      id: mapping.id,
      data: { is_active: !mapping.is_active },
    });
  };

  const mappings = mappingsData?.mappings || [];
  const tiers = tiersData?.tiers || [];

  return (
    <div className={PAGE_SPACING}>
      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          Add Role Mapping
        </Button>
      </div>

      {/* Permission Tiers Reference */}
      <Card padding="md">
        <h3 className="text-sm font-medium text-text-primary mb-3">Permission Tiers Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier: PermissionTierInfo) => (
            <div key={tier.tier} className="p-3 bg-background-light rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={TIER_COLORS[tier.tier] || "default"} size="sm">
                  {tier.name}
                </Badge>
              </div>
              <p className="text-xs text-text-secondary">{tier.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by role name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">All Tiers</option>
            <option value="view_own">View Own</option>
            <option value="view_team">View Team</option>
            <option value="view_all">View All</option>
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-36"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </Card>

      {/* Mappings Table */}
      <Card padding="none">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-error">Failed to load role permission mappings</div>
        ) : mappings.length === 0 ? (
          <div className="p-6 text-center text-text-secondary">
            No role permission mappings found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-light border-b border-border-light">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Salesforce Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Display Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Permission Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {mappings.map((mapping: RolePermissionMapping) => (
                  <tr key={mapping.id} className="hover:bg-background-light/50">
                    <td className="px-4 py-3">
                      <code className="text-sm bg-background-light px-2 py-0.5 rounded">
                        {mapping.salesforce_role}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{mapping.display_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={TIER_COLORS[mapping.permission_tier] || "default"} size="sm">
                        {TIER_LABELS[mapping.permission_tier] || mapping.permission_tier}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={mapping.is_active ? "success" : "default"} size="sm">
                        {mapping.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(mapping)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMappingStatus(mapping)}
                        >
                          {mapping.is_active ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error hover:text-error"
                          onClick={() => setDeleteConfirm(mapping)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {mappingsData && (
          <div className="px-4 py-3 border-t border-border-light text-sm text-text-secondary">
            Showing {mappings.length} of {mappingsData.total} mappings
          </div>
        )}
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4" padding="lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Add Role Permission Mapping
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Salesforce Role"
                placeholder="e.g., quality_assurance_officer"
                value={formData.salesforce_role}
                onChange={(e) => setFormData({ ...formData, salesforce_role: e.target.value })}
                required
              />

              <Input
                label="Display Name"
                placeholder="e.g., Quality Assurance Officer"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Permission Tier
                </label>
                <Select
                  value={formData.permission_tier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permission_tier: e.target.value as "view_own" | "view_team" | "view_all",
                    })
                  }
                >
                  <option value="view_own">View Own - See only their own tasks</option>
                  <option value="view_team">View Team - See team&apos;s tasks</option>
                  <option value="view_all">View All - See all tasks in entity</option>
                </Select>
              </div>

              <Input
                label="Description (optional)"
                placeholder="Brief description of this role"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate} loading={createMutation.isPending}>
                Create Mapping
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingMapping && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4" padding="lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Edit Role Permission Mapping
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-sm text-error">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Salesforce Role (read-only)
                </label>
                <code className="block w-full px-3 py-2 bg-background-light text-text-secondary rounded-lg">
                  {editingMapping.salesforce_role}
                </code>
              </div>

              <Input
                label="Display Name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Permission Tier
                </label>
                <Select
                  value={formData.permission_tier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      permission_tier: e.target.value as "view_own" | "view_team" | "view_all",
                    })
                  }
                >
                  <option value="view_own">View Own - See only their own tasks</option>
                  <option value="view_team">View Team - See team&apos;s tasks</option>
                  <option value="view_all">View All - See all tasks in entity</option>
                </Select>
              </div>

              <Input
                label="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingMapping(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleUpdate} loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4" padding="lg">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete Role Mapping?</h3>
            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to delete the mapping for{" "}
              <strong>{deleteConfirm.display_name}</strong>? Users with this Salesforce role will
              fall back to the default VIEW_OWN permission tier.
            </p>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
