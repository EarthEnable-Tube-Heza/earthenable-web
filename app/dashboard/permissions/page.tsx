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
import { RoleEditor, UserRoleAssignment } from "@/src/components/permissions";
import type { PermissionRole } from "@/src/types/permission";
import type { UserListItem } from "@/src/types/user";

export default function PermissionsPage() {
  const queryClient = useQueryClient();

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | undefined>();
  const [isUserAssignmentOpen, setIsUserAssignmentOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    role: PermissionRole | null;
  }>({
    isOpen: false,
    role: null,
  });

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

  // Fetch users for assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: ["users-for-assignment"],
    queryFn: () => apiClient.getUsers({ limit: 100, is_active: true }),
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

  const handleAssignToUser = (user: UserListItem) => {
    setSelectedUser(user);
    setIsUserAssignmentOpen(true);
  };

  const roles = rolesData?.items || [];

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

      {/* User Assignment Quick Action */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <h3 className="text-lg font-heading font-medium text-text-primary mb-4">
          Quick User Role Assignment
        </h3>
        <div className="max-w-md">
          <LabeledSelect
            options={[
              { value: "", label: "Select a user to manage roles..." },
              ...(usersData?.items.map((user: UserListItem) => ({
                value: user.id,
                label: `${user.name || user.email} (${user.email})`,
              })) || []),
            ]}
            onChange={(e) => {
              const user = usersData?.items.find((u: UserListItem) => u.id === e.target.value);
              if (user) handleAssignToUser(user);
            }}
            value=""
          />
        </div>
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

      {/* User Role Assignment Modal */}
      <UserRoleAssignment
        isOpen={isUserAssignmentOpen}
        onClose={() => {
          setIsUserAssignmentOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSuccess={() => {
          // Optionally refresh data
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
