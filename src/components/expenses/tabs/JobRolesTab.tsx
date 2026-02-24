"use client";

/**
 * Job Roles Tab (Admin Only)
 *
 * Job role management with seniority levels and entity-specific roles.
 * Paginated table with inline icon actions and edit modal.
 */

import { useState, useMemo } from "react";
import {
  Input,
  Button,
  LabeledSelect,
  Card,
  Badge,
  Toast,
  ConfirmDialog,
} from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import {
  Plus,
  XCircle,
  Save,
  Info,
  Briefcase,
  Edit,
  Trash2,
  CheckCircle,
  X,
} from "@/src/lib/icons";
import {
  useJobRoles,
  useCreateJobRole,
  useUpdateJobRole,
  useDeleteJobRole,
  useSeniorityLevels,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";

const PAGE_SIZE = 15;

const getSeniorityBadgeVariant = (rank: number): "info" | "success" | "warning" | "error" => {
  if (rank >= 6) return "error";
  if (rank >= 4) return "warning";
  if (rank >= 2) return "info";
  return "success";
};

const emptyFormData = {
  name: "",
  code: "",
  seniority_level_id: "",
  description: "",
  isActive: true,
};

export function JobRolesTab() {
  const { selectedEntityId } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, type: "success" as ToastType, message: "" });
  const [formData, setFormData] = useState({ ...emptyFormData });
  const [editFormData, setEditFormData] = useState({ ...emptyFormData });
  const [page, setPage] = useState(0);
  const [deactivateConfirm, setDeactivateConfirm] = useState<{
    roleId: string;
    roleName: string;
  } | null>(null);

  const { data, isLoading } = useJobRoles(selectedEntityId || undefined);
  const createJobRole = useCreateJobRole(selectedEntityId || undefined);
  const updateJobRole = useUpdateJobRole(selectedEntityId || undefined);
  const deleteJobRole = useDeleteJobRole(selectedEntityId || undefined);
  const { data: seniorityLevels = [] } = useSeniorityLevels(selectedEntityId || undefined);

  const jobRoles = useMemo(() => data?.job_roles || [], [data?.job_roles]);
  const total = jobRoles.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginatedRoles = useMemo(() => {
    const start = page * PAGE_SIZE;
    return jobRoles.slice(start, start + PAGE_SIZE);
  }, [jobRoles, page]);

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
      setFormData({ ...emptyFormData });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to create job role. Please try again.",
      });
      console.error(error);
    }
  };

  const handleStartEdit = (role: (typeof jobRoles)[0]) => {
    setEditingRole(role.id);
    setEditFormData({
      name: role.name,
      code: role.code,
      seniority_level_id: role.seniority_level_id || "",
      description: role.description || "",
      isActive: role.is_active,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await updateJobRole.mutateAsync({
        roleId: editingRole,
        data: {
          name: editFormData.name,
          code: editFormData.code,
          seniority_level_id: editFormData.seniority_level_id || null,
          description: editFormData.description || null,
          is_active: editFormData.isActive,
        },
      });
      setToast({ visible: true, type: "success", message: "Job role updated successfully!" });
      setEditingRole(null);
      setEditFormData({ ...emptyFormData });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to update job role. Please try again.",
      });
      console.error(error);
    }
  };

  const handleDeactivate = (roleId: string, roleName: string) => {
    setDeactivateConfirm({ roleId, roleName });
  };

  const confirmDeactivate = async () => {
    if (!deactivateConfirm) return;
    try {
      await deleteJobRole.mutateAsync(deactivateConfirm.roleId);
      setToast({ visible: true, type: "success", message: "Job role deactivated successfully!" });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to deactivate job role. Please try again.",
      });
      console.error(error);
    } finally {
      setDeactivateConfirm(null);
    }
  };

  const handleReactivate = async (roleId: string) => {
    try {
      await updateJobRole.mutateAsync({ roleId, data: { is_active: true } });
      setToast({ visible: true, type: "success", message: "Job role reactivated successfully!" });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to reactivate job role. Please try again.",
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
                  setFormData({ ...emptyFormData });
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

      {/* Job Roles Table */}
      {!selectedEntityId ? (
        <Card variant="bordered" padding="lg">
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">
              Please select an entity from the header to view and manage job roles
            </p>
          </div>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow-medium overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-text-secondary mt-2">Loading job roles...</p>
            </div>
          ) : jobRoles.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary mb-2">No job roles found for this entity</p>
              <p className="text-sm text-text-tertiary">
                Create your first job role to start organizing your workforce
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-background-light border-b border-border-light">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Seniority Level
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {paginatedRoles.map((role) => (
                      <tr key={role.id} className="hover:bg-background-light transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {role.name}
                            </span>
                            {!role.is_active && (
                              <Badge variant="error" size="sm">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-text-secondary">{role.code}</span>
                        </td>
                        <td className="px-4 py-4">
                          {role.seniority_level_name ? (
                            <Badge
                              variant={getSeniorityBadgeVariant(
                                seniorityLevels.find((sl) => sl.id === role.seniority_level_id)
                                  ?.rank ?? 0
                              )}
                              size="sm"
                            >
                              {role.seniority_level_name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-text-tertiary italic">None</span>
                          )}
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          {role.description ? (
                            <p className="text-sm text-text-secondary truncate">
                              {role.description}
                            </p>
                          ) : (
                            <span className="text-sm text-text-tertiary italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={role.is_active ? "success" : "error"} size="sm">
                            {role.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(role)}
                              className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                              title="Edit job role"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {role.is_active ? (
                              <button
                                onClick={() => handleDeactivate(role.id, role.name)}
                                className="p-2 rounded-lg text-status-error hover:bg-status-error/10 transition-colors"
                                title="Deactivate job role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(role.id)}
                                className="p-2 rounded-lg text-status-success hover:bg-status-success/10 transition-colors"
                                title="Activate job role"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
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
                    Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, total)} of{" "}
                    {total} roles
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(0)}
                      disabled={page === 0}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-1 text-sm text-text-secondary">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(totalPages - 1)}
                      disabled={page >= totalPages - 1}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-text-primary">Edit Job Role</h4>
              <button
                onClick={() => {
                  setEditingRole(null);
                  setEditFormData({ ...emptyFormData });
                }}
                className="p-1.5 rounded-lg text-text-tertiary hover:bg-background-light transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Input
                label="Role Name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
              <Input
                label="Role Code"
                type="text"
                value={editFormData.code}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })
                }
                required
              />
              <LabeledSelect
                label="Seniority Level"
                value={editFormData.seniority_level_id}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, seniority_level_id: e.target.value })
                }
                options={[{ value: "", label: "None" }, ...seniorityOptions]}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe the responsibilities and requirements for this role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editFormData.isActive}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="editIsActive" className="text-sm text-text-secondary">
                  Active
                </label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingRole(null);
                    setEditFormData({ ...emptyFormData });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={updateJobRole.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deactivateConfirm}
        title="Deactivate Job Role"
        message={`Are you sure you want to deactivate "${deactivateConfirm?.roleName || ""}"? This role will no longer be available for employee assignments.`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivateConfirm(null)}
      />
    </div>
  );
}
