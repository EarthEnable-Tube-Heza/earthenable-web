"use client";

/**
 * Permission Management Page (Admin only)
 *
 * Manages permission roles for granular access control.
 * Allows creating, editing, and deleting custom permission roles.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PageTitle } from "@/src/components/dashboard/PageTitle";
import { PAGE_SPACING } from "@/src/lib/theme";
import { Button, Badge, ConfirmDialog, Spinner, LabeledSelect } from "@/src/components/ui";
import { RoleEditor, UserSearchMultiSelect } from "@/src/components/permissions";
import type { PermissionRole, BulkAssignRoleResponse } from "@/src/types/permission";
import type { UserListItem } from "@/src/types/user";

export default function PermissionsPage() {
  const queryClient = useQueryClient();

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    role: PermissionRole | null;
  }>({
    isOpen: false,
    role: null,
  });

  // Bulk assignment states
  const [bulkSelectedUsers, setBulkSelectedUsers] = useState<UserListItem[]>([]);
  const [bulkSelectedRoleId, setBulkSelectedRoleId] = useState<string>("");
  const [bulkAssignResult, setBulkAssignResult] = useState<BulkAssignRoleResponse | null>(null);

  // Fetch permission roles
  const {
    data: rolesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["permission-roles"],
    queryFn: () => apiClient.getPermissionRoles(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (roleId: string) => apiClient.deletePermissionRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-roles"] });
      setDeleteConfirm({ isOpen: false, role: null });
    },
  });

  // Seed default roles mutation
  const seedMutation = useMutation({
    mutationFn: () => apiClient.seedDefaultPermissionRoles(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permission-roles"] });
    },
  });

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: () =>
      apiClient.bulkAssignPermissionRole({
        user_ids: bulkSelectedUsers.map((u) => u.id),
        role_id: bulkSelectedRoleId,
      }),
    onSuccess: (result) => {
      setBulkAssignResult(result);
      if (result.successful > 0) {
        setBulkSelectedUsers([]);
        setBulkSelectedRoleId("");
      }
    },
  });

  useSetPageHeader({
    title: "Permissions",
    pathLabels: { permissions: "Permissions" },
  });

  const handleEditRole = (roleId: string) => {
    setEditingRoleId(roleId);
    setIsEditorOpen(true);
  };

  const handleDeleteRole = (role: PermissionRole) => {
    setDeleteConfirm({ isOpen: true, role });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.role) {
      deleteMutation.mutate(deleteConfirm.role.id);
    }
  };

  const handleBulkAssign = () => {
    if (bulkSelectedUsers.length === 0 || !bulkSelectedRoleId) return;
    setBulkAssignResult(null);
    bulkAssignMutation.mutate();
  };

  const roles = rolesData?.items || [];
  const activeRoles = roles.filter((r: PermissionRole) => r.is_active);

  return (
    <div className={PAGE_SPACING}>
      {/* Page Title */}
      <PageTitle
        title="Permission Roles"
        description="Create and manage permission roles to control access to different parts of the application."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setEditingRoleId(undefined);
              setIsEditorOpen(true);
            }}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Create Role
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">{roles.length}</div>
              <div className="text-sm text-text-secondary">Total Roles</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-status-success/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-status-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {roles.filter((r: PermissionRole) => r.is_active).length}
              </div>
              <div className="text-sm text-text-secondary">Active Roles</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-medium p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-status-info/10 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-status-info"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary">
                {roles.filter((r: PermissionRole) => r.is_system_role).length}
              </div>
              <div className="text-sm text-text-secondary">System Roles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk User Role Assignment */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-heading font-medium text-text-primary">
              Bulk Role Assignment
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Search and select multiple users to assign a role to all of them at once.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Search */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Select Users</label>
            <UserSearchMultiSelect
              selectedUsers={bulkSelectedUsers}
              onSelectionChange={setBulkSelectedUsers}
              placeholder="Search users by name or email..."
              disabled={bulkAssignMutation.isPending}
            />
          </div>

          {/* Role Selection & Action */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Select Role</label>
            <div className="space-y-4">
              <LabeledSelect
                value={bulkSelectedRoleId}
                onChange={(e) => setBulkSelectedRoleId(e.target.value)}
                disabled={bulkAssignMutation.isPending || activeRoles.length === 0}
                options={[
                  { value: "", label: "Choose a role to assign..." },
                  ...activeRoles.map((role: PermissionRole) => ({
                    value: role.id,
                    label: `${role.name}${role.entity ? ` (${role.entity.code})` : ""}`,
                  })),
                ]}
              />

              <Button
                variant="primary"
                onClick={handleBulkAssign}
                disabled={
                  bulkSelectedUsers.length === 0 ||
                  !bulkSelectedRoleId ||
                  bulkAssignMutation.isPending
                }
                loading={bulkAssignMutation.isPending}
                className="w-full"
              >
                Assign Role to {bulkSelectedUsers.length} User
                {bulkSelectedUsers.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Assignment Result */}
        {bulkAssignResult && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              bulkAssignResult.failed === 0
                ? "bg-status-success/10 border border-status-success/30"
                : bulkAssignResult.successful === 0
                  ? "bg-status-error/10 border border-status-error/30"
                  : "bg-status-warning/10 border border-status-warning/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">
                  {bulkAssignResult.failed === 0
                    ? "All assignments successful!"
                    : bulkAssignResult.successful === 0
                      ? "All assignments failed"
                      : "Partial success"}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {bulkAssignResult.successful} of {bulkAssignResult.total} users assigned
                  successfully
                  {bulkAssignResult.failed > 0 && ` (${bulkAssignResult.failed} failed)`}
                </p>
              </div>
              <button
                onClick={() => setBulkAssignResult(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {bulkAssignResult.failed > 0 && (
              <div className="mt-3 text-sm">
                <p className="font-medium text-text-primary mb-1">Failed assignments:</p>
                <ul className="space-y-1">
                  {bulkAssignResult.results
                    .filter((r) => !r.success)
                    .slice(0, 5)
                    .map((r) => (
                      <li key={r.user_id} className="text-status-error">
                        User {r.user_id.slice(0, 8)}...: {r.error}
                      </li>
                    ))}
                  {bulkAssignResult.results.filter((r) => !r.success).length > 5 && (
                    <li className="text-text-secondary">
                      ... and {bulkAssignResult.results.filter((r) => !r.success).length - 5} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {bulkAssignMutation.isError && (
          <div className="mt-4 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
            <p className="text-sm text-status-error">
              {(bulkAssignMutation.error as Error)?.message || "Failed to assign roles"}
            </p>
          </div>
        )}
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Spinner size="lg" centered />
            <p className="text-text-secondary mt-2">Loading roles...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-status-error">Error loading roles. Please try again.</p>
            <Button variant="primary" size="sm" onClick={() => refetch()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : roles.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-text-tertiary mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-text-secondary">No permission roles yet.</p>
            <p className="text-text-tertiary text-sm mt-1">
              Create your first role or seed the default system roles.
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => seedMutation.mutate()}
                loading={seedMutation.isPending}
              >
                Seed Default Roles
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingRoleId(undefined);
                  setIsEditorOpen(true);
                }}
              >
                Create Role
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-background-light border-b border-border-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {roles.map((role: PermissionRole) => (
                  <tr key={role.id} className="hover:bg-background-light transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-text-secondary truncate max-w-xs">
                          {role.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {role.entity ? (
                        <Badge variant="default" size="sm">
                          {role.entity.code}
                        </Badge>
                      ) : (
                        <span className="text-text-tertiary text-sm">Global</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={role.is_active ? "success" : "default"} size="sm">
                        {role.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {role.is_system_role ? (
                        <Badge variant="info" size="sm">
                          System
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Custom
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(role.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditRole(role.id)}
                          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        {!role.is_system_role && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="text-status-error hover:text-status-error/80 text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Editor Modal */}
      <RoleEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingRoleId(undefined);
        }}
        roleId={editingRoleId}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${deleteConfirm.role?.name}"? This action cannot be undone. Users with this role will lose the associated permissions.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, role: null })}
      />
    </div>
  );
}
