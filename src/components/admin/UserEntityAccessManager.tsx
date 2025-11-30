"use client";

/**
 * User Entity Access Manager Component
 *
 * Main component for managing user entity access.
 * Displays users in a table with their entity access and provides
 * actions to grant/revoke access.
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { apiClient } from "@/src/lib/api/apiClient";
import { UserWithEntityAccess, EntityListResponse } from "@/src/types";
import {
  Card,
  Input,
  Button,
  Badge,
  Spinner,
  Alert,
  ConfirmDialog,
  Toast,
} from "@/src/components/ui";
import { GrantEntityAccessModal } from "./GrantEntityAccessModal";

export function UserEntityAccessManager() {
  const [users, setUsers] = useState<UserWithEntityAccess[]>([]);
  const [entities, setEntities] = useState<EntityListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithEntityAccess | null>(null);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [revokeConfirm, setRevokeConfirm] = useState<{ userId: string; entityId: string } | null>(
    null
  );
  const [toast, setToast] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    visible: false,
    type: "success",
    message: "",
  });

  // Fetch users with entity access
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUsersWithEntityAccess({
        search: searchQuery || undefined,
      });
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Fetch available entities
  const fetchEntities = async () => {
    try {
      const data = await apiClient.getEntitiesForAdmin(false);
      setEntities(data);
    } catch (err) {
      console.error("Error fetching entities:", err);
    }
  };

  // Load data on mount and when search changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load entities on mount
  useEffect(() => {
    fetchEntities();
  }, []);

  // Handle grant access
  const handleGrantAccess = (user: UserWithEntityAccess) => {
    setSelectedUser(user);
    setShowGrantModal(true);
  };

  // Handle revoke access - Show confirmation dialog
  const handleRevokeAccess = (userId: string, entityId: string) => {
    setRevokeConfirm({ userId, entityId });
  };

  // Confirm revoke access
  const confirmRevokeAccess = async () => {
    if (!revokeConfirm) return;

    try {
      await apiClient.revokeEntityAccess(revokeConfirm.userId, revokeConfirm.entityId);
      // Refresh the user list
      await fetchUsers();
      // Show success toast
      setToast({
        visible: true,
        type: "success",
        message: "Entity access revoked successfully",
      });
    } catch (err) {
      // Show error toast
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to revoke access",
      });
      console.error("Error revoking access:", err);
    } finally {
      setRevokeConfirm(null);
    }
  };

  // Cancel revoke access
  const cancelRevokeAccess = () => {
    setRevokeConfirm(null);
  };

  // Handle modal close and refresh
  const handleModalClose = async (success: boolean) => {
    setShowGrantModal(false);
    setSelectedUser(null);
    if (success) {
      await fetchUsers();
    }
  };

  if (loading && users.length === 0) {
    return (
      <Card variant="bordered" padding="lg">
        <Spinner centered label="Loading users..." />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card variant="bordered" padding="md">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="md"
            />
          </div>
          <Button onClick={fetchUsers} variant="outline">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Card variant="bordered" padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-light border-b border-border-light">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Entity Access
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-background-light transition-colors">
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.picture && (
                          <Image
                            src={user.picture}
                            alt={user.name || user.email}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium text-text-primary">
                            {user.name || "No name"}
                          </div>
                          <div className="text-sm text-text-secondary">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <Badge variant="primary" size="sm">
                        {user.role.replace("_", " ").toUpperCase()}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <Badge variant="success" dot size="sm">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="error" dot size="sm">
                          Inactive
                        </Badge>
                      )}
                    </td>

                    {/* Entity Access */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.entity_access.length === 0 ? (
                          <span className="text-sm text-text-secondary italic">No entities</span>
                        ) : (
                          user.entity_access
                            .filter((access) => access.is_active)
                            .map((access) => (
                              <div key={access.id} className="relative group">
                                <Badge variant={access.is_parent ? "warning" : "default"} size="sm">
                                  {access.entity_code}
                                  <button
                                    onClick={() => handleRevokeAccess(user.id, access.entity_id)}
                                    className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Revoke access"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              </div>
                            ))
                        )}
                      </div>
                      <div className="mt-1 text-xs text-text-secondary">
                        {user.accessible_entity_count}{" "}
                        {user.accessible_entity_count === 1 ? "entity" : "entities"}
                        {user.default_entity_name && <> • Default: {user.default_entity_name}</>}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" onClick={() => handleGrantAccess(user)}>
                        Manage Access
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grant Entity Access Modal */}
      {showGrantModal && selectedUser && (
        <GrantEntityAccessModal
          user={selectedUser}
          entities={entities}
          onClose={handleModalClose}
        />
      )}

      {/* Revoke Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!revokeConfirm}
        title="Revoke Entity Access"
        message="Are you sure you want to revoke this entity access? This action cannot be undone."
        confirmLabel="Revoke Access"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmRevokeAccess}
        onCancel={cancelRevokeAccess}
      />

      {/* Toast Notification */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />
    </div>
  );
}
