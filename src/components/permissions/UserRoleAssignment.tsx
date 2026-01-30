"use client";

/**
 * User Role Assignment Component
 *
 * Modal dialog for assigning permission roles to users.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { Button, Spinner, Badge, LabeledSelect } from "@/src/components/ui";
import type { PermissionRole, UserPermissionRoleAssignment } from "@/src/types/permission";

interface UserBasic {
  id: string;
  email: string;
  name?: string;
}

interface UserRoleAssignmentProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserBasic | null;
  onSuccess?: () => void;
}

export function UserRoleAssignment({ isOpen, onClose, user, onSuccess }: UserRoleAssignmentProps) {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Fetch available roles
  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ["permission-roles"],
    queryFn: () => apiClient.getPermissionRoles(),
    enabled: isOpen,
  });

  // Fetch user's current roles
  const { data: userRoles, isLoading: loadingUserRoles } = useQuery({
    queryKey: ["user-permission-roles", user?.id],
    queryFn: () => apiClient.getUserPermissionRoles(user!.id),
    enabled: isOpen && !!user?.id,
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedRoleId("");
      setError("");
    }
  }, [isOpen]);

  // Assign role mutation
  const assignMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      return apiClient.assignPermissionRoleToUser(userId, { role_id: roleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permission-roles", user?.id] });
      setSelectedRoleId("");
      setError("");
      onSuccess?.();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to assign role");
    },
  });

  // Remove role mutation
  const removeMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      return apiClient.removePermissionRoleFromUser(userId, roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-permission-roles", user?.id] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to remove role");
    },
  });

  const handleAssign = () => {
    if (!user?.id || !selectedRoleId) return;
    assignMutation.mutate({ userId: user.id, roleId: selectedRoleId });
  };

  const handleRemove = (roleId: string) => {
    if (!user?.id) return;
    removeMutation.mutate({ userId: user.id, roleId });
  };

  // Get roles that haven't been assigned yet
  const availableRoles =
    rolesData?.items.filter(
      (role: PermissionRole) =>
        role.is_active &&
        !userRoles?.roles.some((ur: UserPermissionRoleAssignment) => ur.role_id === role.id)
    ) || [];

  const isLoading = loadingRoles || loadingUserRoles;
  const isSaving = assignMutation.isPending || removeMutation.isPending;

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-bold text-text-primary">Manage User Roles</h2>
            <p className="text-sm text-text-secondary mt-1">{user.name || user.email}</p>
          </div>
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
        <div className="px-6 py-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Current Roles */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Assigned Roles</h3>
                {userRoles?.roles && userRoles.roles.length > 0 ? (
                  <div className="space-y-2">
                    {userRoles.roles.map((assignment: UserPermissionRoleAssignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-background-light rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm text-text-primary">
                            {assignment.role.name}
                          </div>
                          {assignment.role.description && (
                            <div className="text-xs text-text-secondary">
                              {assignment.role.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            {assignment.role.is_system_role && (
                              <Badge variant="info" size="sm">
                                System
                              </Badge>
                            )}
                            {assignment.entity && (
                              <Badge variant="default" size="sm">
                                {assignment.entity.code}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(assignment.role_id)}
                          disabled={isSaving}
                          className="text-status-error hover:bg-status-error/10"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-background-light rounded-lg">
                    <p className="text-sm text-text-secondary">No roles assigned</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      Permissions will be derived from the user&apos;s base role
                    </p>
                  </div>
                )}
              </div>

              {/* Assign New Role */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">Assign New Role</h3>
                {availableRoles.length > 0 ? (
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <LabeledSelect
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                        disabled={isSaving}
                        options={[
                          { value: "", label: "Select a role..." },
                          ...availableRoles.map((role: PermissionRole) => ({
                            value: role.id,
                            label: `${role.name}${role.entity ? ` (${role.entity.code})` : ""}`,
                          })),
                        ]}
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleAssign}
                      disabled={!selectedRoleId || isSaving}
                      loading={assignMutation.isPending}
                    >
                      Assign
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-background-light rounded-lg">
                    <p className="text-sm text-text-secondary">
                      {rolesData?.items.length === 0
                        ? "No roles available. Create a role first."
                        : "All available roles have been assigned."}
                    </p>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-status-error/10 border border-status-error/30 rounded-md p-3">
                  <p className="text-sm text-status-error">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light flex items-center justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
