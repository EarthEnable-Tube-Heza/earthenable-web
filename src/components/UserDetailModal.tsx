"use client";

/**
 * User Detail Modal
 *
 * Modal for viewing and editing user details (admin only).
 * Supports dynamic string roles from Salesforce.
 */

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import { formatRoleLabel, KnownRoles } from "../types/user";
import { cn } from "../lib/theme";
import { Select } from "./ui/Select";
import { Input } from "./ui/Input";

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({ userId, isOpen, onClose }: UserDetailModalProps) {
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null);

  // Fetch user details
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.getUserById(userId!),
    enabled: !!userId && isOpen,
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => apiClient.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      setEditMode(false);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiClient.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      setEditMode(false);
    },
  });

  /**
   * Handle save changes
   */
  const handleSave = async () => {
    if (!user || !userId) return;

    try {
      // Update role if changed
      if (selectedRole && selectedRole !== user.role) {
        await updateRoleMutation.mutateAsync({ id: userId, role: selectedRole });
      }

      // Update status if changed
      if (selectedStatus !== null && selectedStatus !== user.is_active) {
        await updateStatusMutation.mutateAsync({ id: userId, isActive: selectedStatus });
      }

      setEditMode(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  /**
   * Handle edit mode toggle
   */
  const handleEdit = () => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedStatus(user.is_active);
      setEditMode(true);
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    setSelectedRole(null);
    setSelectedStatus(null);
    setEditMode(false);
  };

  /**
   * Get role badge color based on role
   */
  const getRoleBadgeColor = (role: string) => {
    if (role === KnownRoles.ADMIN) {
      return "bg-status-error/10 text-status-error";
    } else if (role === KnownRoles.MANAGER || role.includes("manager")) {
      return "bg-primary/10 text-primary";
    } else if (role === KnownRoles.QA_AGENT || role.includes("qa") || role.includes("quality")) {
      return "bg-status-info/10 text-status-info";
    } else if (role === KnownRoles.SYSTEM_USER) {
      return "bg-accent/10 text-accent";
    } else if (role === KnownRoles.PENDING_ASSIGNMENT) {
      return "bg-status-warning/10 text-status-warning";
    }
    return "bg-green/10 text-green"; // Default for Salesforce roles like surveyor
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-large w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-center justify-between sticky top-0 bg-white">
            <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
              User Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-text-secondary mt-2">Loading user details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-status-error">Failed to load user details.</p>
              </div>
            ) : user ? (
              <div className="space-y-6">
                {/* User Profile */}
                <div className="flex items-center gap-4">
                  {user.picture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.picture}
                      alt={user.name || user.email}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center font-heading font-bold text-2xl">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-heading font-bold text-text-primary">
                      {user.name || user.email}
                    </h3>
                    <p className="text-text-secondary">{user.email}</p>
                  </div>
                </div>

                {/* User Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Role
                    </label>
                    {editMode ? (
                      <Input
                        type="text"
                        value={selectedRole || user.role}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        placeholder="Enter role (e.g., admin, manager, surveyor)"
                      />
                    ) : (
                      <span
                        className={cn(
                          "inline-block px-2 py-1 text-sm font-medium rounded-full",
                          getRoleBadgeColor(user.role)
                        )}
                      >
                        {formatRoleLabel(user.role)}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Status
                    </label>
                    {editMode ? (
                      <Select
                        value={
                          selectedStatus === null ? String(user.is_active) : String(selectedStatus)
                        }
                        onChange={(e) => setSelectedStatus(e.target.value === "true")}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </Select>
                    ) : (
                      <span
                        className={cn(
                          "inline-block px-2 py-1 text-sm font-medium rounded-full",
                          user.is_active
                            ? "bg-status-success/10 text-status-success"
                            : "bg-text-disabled/10 text-text-disabled"
                        )}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </div>

                  {/* Google ID */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Google ID
                    </label>
                    <p className="text-sm text-text-primary truncate" title={user.google_id}>
                      {user.google_id || "N/A"}
                    </p>
                  </div>

                  {/* Verified */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Verified
                    </label>
                    <p className="text-sm text-text-primary">
                      {user.is_verified ? "✓ Yes" : "✗ No"}
                    </p>
                  </div>

                  {/* Created At */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Joined
                    </label>
                    <p className="text-sm text-text-primary">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Last Login */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Last Login
                    </label>
                    <p className="text-sm text-text-primary">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="border-t border-border-light pt-4">
                  <h4 className="text-sm font-medium text-text-secondary mb-3">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background-light p-4 rounded-lg">
                      <p className="text-2xl font-heading font-bold text-primary">
                        {user.tasks_count}
                      </p>
                      <p className="text-sm text-text-secondary">Tasks</p>
                    </div>
                    <div className="bg-background-light p-4 rounded-lg">
                      <p className="text-2xl font-heading font-bold text-primary">
                        {user.cases_count}
                      </p>
                      <p className="text-sm text-text-secondary">Cases</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {user && (
            <div className="px-6 py-4 border-t border-border-light flex items-center justify-end gap-3">
              {editMode ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-border-light rounded-md text-text-primary hover:bg-background-light transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateRoleMutation.isPending || updateStatusMutation.isPending}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateRoleMutation.isPending || updateStatusMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-border-light rounded-md text-text-primary hover:bg-background-light transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Edit User
                  </button>
                </>
              )}
            </div>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
