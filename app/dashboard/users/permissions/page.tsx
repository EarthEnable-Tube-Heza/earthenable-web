"use client";

/**
 * Permission Management Page (Admin only)
 *
 * Displays org hierarchy entries with CRUD operations for managing
 * user permissions and organizational roles.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { cn, PAGE_SPACING } from "@/src/lib/theme";
import { LabeledSelect, MultiSelect, Button } from "@/src/components/ui";
import { OrgHierarchyListItem, OrgRoleOption } from "@/src/types";

export default function PermissionsPage() {
  useSetPageHeader({
    title: "Permissions",
    pathLabels: { users: "Users", permissions: "Permissions" },
  });

  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<boolean | "">("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<OrgHierarchyListItem | null>(null);
  const limit = 20;

  // Fetch org hierarchy entries
  const { data, isLoading, error } = useQuery({
    queryKey: ["org-hierarchy", page, roleFilter, statusFilter],
    queryFn: () =>
      apiClient.getOrgHierarchyEntries({
        skip: page * limit,
        limit,
        role: roleFilter.length > 0 ? roleFilter.join(",") : undefined,
        is_active: statusFilter === "" ? undefined : statusFilter,
      }),
  });

  // Fetch available roles
  const { data: rolesData } = useQuery({
    queryKey: ["org-roles"],
    queryFn: () => apiClient.getOrgRoles(),
  });

  const entries = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const roles = rolesData || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => apiClient.deleteOrgHierarchyEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-hierarchy"] });
    },
  });

  // Handle delete
  const handleDelete = async (entry: OrgHierarchyListItem) => {
    if (
      confirm(
        `Are you sure you want to delete the org hierarchy entry for ${entry.user_name || entry.user_email}?`
      )
    ) {
      deleteMutation.mutate(entry.id);
    }
  };

  // Format role label
  const formatRoleLabel = (role: string): string => {
    const roleOption = roles.find((r) => r.value === role);
    return roleOption?.label || role.replace(/_/g, " ");
  };

  return (
    <div className={PAGE_SPACING}>
      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
          Add Permission Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-medium p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Role Filter */}
          <MultiSelect
            label="Role"
            placeholder="All Roles"
            options={roles.map((role) => ({ value: role.value, label: role.label }))}
            value={roleFilter}
            onChange={(values) => {
              setRoleFilter(values);
              setPage(0);
            }}
            size="sm"
          />

          {/* Status Filter */}
          <LabeledSelect
            label="Status"
            value={statusFilter === "" ? "" : statusFilter ? "true" : "false"}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value === "" ? "" : value === "true");
              setPage(0);
            }}
            options={[
              { value: "", label: "All" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            fullWidth
          />
        </div>

        {/* Active Filters Indicator */}
        {(roleFilter.length > 0 || statusFilter !== "") && (
          <div className="mt-4 pt-4 border-t border-border-light">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                  Active Filters:
                </span>

                {roleFilter.map((role) => (
                  <span
                    key={`role-${role}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                  >
                    Role: {formatRoleLabel(role)}
                    <button
                      onClick={() => {
                        setRoleFilter(roleFilter.filter((r) => r !== role));
                        setPage(0);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${formatRoleLabel(role)} filter`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {statusFilter !== "" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Status: {statusFilter ? "Active" : "Inactive"}
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setPage(0);
                      }}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove status filter"
                    >
                      ×
                    </button>
                  </span>
                )}

                <button
                  onClick={() => {
                    setRoleFilter([]);
                    setStatusFilter("");
                    setPage(0);
                  }}
                  className="text-xs text-status-error hover:text-status-error/80 font-medium ml-2"
                >
                  Clear all
                </button>
              </div>

              <p className="text-sm text-text-secondary">
                Found {total} permission entr{total !== 1 ? "ies" : "y"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-2">Loading permissions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-status-error">Error loading permissions. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-text-tertiary mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-text-secondary">No permission entries found.</p>
            {(roleFilter.length > 0 || statusFilter !== "") && (
              <button
                onClick={() => {
                  setRoleFilter([]);
                  setStatusFilter("");
                  setPage(0);
                }}
                className="mt-4 text-primary hover:text-primary/80 text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Horizontal scroll container for mobile */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-background-light border-b border-border-light">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Reports To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-background-light transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-text-primary">
                            {entry.user_name || "—"}
                          </div>
                          <div className="text-sm text-text-secondary">{entry.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">
                        {entry.department_name || entry.department_id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          {formatRoleLabel(entry.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {entry.reports_to_name || entry.reports_to_user_id || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {entry.hierarchy_level}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded-full",
                            entry.is_active
                              ? "bg-status-success/10 text-status-success"
                              : "bg-text-disabled/10 text-text-disabled"
                          )}
                        >
                          {entry.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
                            className="text-status-error hover:text-status-error/80 text-sm font-medium transition-colors"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}{" "}
                  entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      page === 0
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium",
                      page === 0
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-text-secondary">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium",
                      page >= totalPages - 1
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium",
                      page >= totalPages - 1
                        ? "bg-background-light text-text-disabled cursor-not-allowed"
                        : "bg-white border border-border-light text-text-primary hover:bg-background-light"
                    )}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingEntry) && (
        <PermissionModal
          entry={editingEntry}
          roles={roles}
          onClose={() => {
            setShowCreateModal(false);
            setEditingEntry(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["org-hierarchy"] });
            setShowCreateModal(false);
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}

// Modal component for creating/editing permissions
interface PermissionModalProps {
  entry: OrgHierarchyListItem | null;
  roles: OrgRoleOption[];
  onClose: () => void;
  onSuccess: () => void;
}

function PermissionModal({ entry, roles, onClose, onSuccess }: PermissionModalProps) {
  const isEditing = !!entry;
  const [formData, setFormData] = useState({
    user_id: entry?.user_id || "",
    department_id: entry?.department_id || "",
    role: entry?.role || roles[0]?.value || "",
    reports_to_user_id: entry?.reports_to_user_id || "",
    hierarchy_level: entry?.hierarchy_level || 1,
    is_active: entry?.is_active ?? true,
    effective_from: new Date().toISOString().split("T")[0],
    effective_to: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing) {
        await apiClient.updateOrgHierarchyEntry(entry.id, {
          role: formData.role,
          reports_to_user_id: formData.reports_to_user_id || undefined,
          hierarchy_level: formData.hierarchy_level,
          is_active: formData.is_active,
          effective_to: formData.effective_to || undefined,
        });
      } else {
        await apiClient.createOrgHierarchyEntry({
          user_id: formData.user_id,
          department_id: formData.department_id,
          role: formData.role,
          reports_to_user_id: formData.reports_to_user_id || undefined,
          hierarchy_level: formData.hierarchy_level,
          effective_from: formData.effective_from,
        });
      }
      onSuccess();
    } catch (err) {
      setError((err as Error).message || "Failed to save permission entry");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected role's permissions for display
  const selectedRole = roles.find((r) => r.value === formData.role);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-xl font-semibold text-text-primary">
            {isEditing ? "Edit Permission Entry" : "Add Permission Entry"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-error/10 text-error rounded-md text-sm">{error}</div>}

          {!isEditing && (
            <>
              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  User ID <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  required
                  placeholder="Enter user ID (e.g., Salesforce Contact ID)"
                  className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Department ID */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Department ID <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  required
                  placeholder="Enter department ID"
                  className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          )}

          {/* Role */}
          <LabeledSelect
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            options={roles.map((role) => ({ value: role.value, label: role.label }))}
            fullWidth
          />

          {/* Role Permissions Display */}
          {selectedRole && (
            <div className="p-4 bg-background-light rounded-md">
              <h4 className="text-sm font-medium text-text-primary mb-2">Role Permissions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Task Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRole.task_permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded"
                      >
                        {perm.replace("task:", "")}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">Expense Permissions</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRole.expense_permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded"
                      >
                        {perm.replace("expense:", "")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports To */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Reports To (User ID)
            </label>
            <input
              type="text"
              value={formData.reports_to_user_id}
              onChange={(e) => setFormData({ ...formData, reports_to_user_id: e.target.value })}
              placeholder="Enter manager/supervisor user ID (optional)"
              className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Hierarchy Level */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Hierarchy Level
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={formData.hierarchy_level}
              onChange={(e) =>
                setFormData({ ...formData, hierarchy_level: parseInt(e.target.value) || 1 })
              }
              className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-text-secondary mt-1">
              1 = lowest level (individual contributor), higher = more senior
            </p>
          </div>

          {isEditing && (
            <>
              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-border-light text-primary focus:ring-primary"
                />
                <label htmlFor="is_active" className="text-sm text-text-primary">
                  Active
                </label>
              </div>

              {/* Effective To Date */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Effective To (End Date)
                </label>
                <input
                  type="date"
                  value={formData.effective_to}
                  onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
                  className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Leave empty if this permission is still active
                </p>
              </div>
            </>
          )}

          {!isEditing && (
            /* Effective From Date */
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Effective From <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={formData.effective_from}
                onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                required
                className="w-full px-4 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
