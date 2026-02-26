"use client";

/**
 * Seniority Levels Tab (Admin Only)
 *
 * CRUD management for seniority levels (global and entity-scoped).
 * Global levels (entity_id IS NULL) are shown with a "Global" badge and are read-only.
 * Paginated table with inline icon actions and edit modal.
 */

import { useState, useMemo } from "react";
import { Input, Button, Card, Badge, Toast, ConfirmDialog } from "@/src/components/ui";
import type { ToastType } from "@/src/components/ui/Toast";
import { Plus, XCircle, Save, Info, Award, Edit, Trash2, CheckCircle, X } from "@/src/lib/icons";
import {
  useSeniorityLevels,
  useCreateSeniorityLevel,
  useUpdateSeniorityLevel,
  useDeleteSeniorityLevel,
} from "@/src/hooks/useExpenses";
import { useAuth } from "@/src/lib/auth";

const PAGE_SIZE = 15;

const getRankBadgeVariant = (rank: number): "info" | "success" | "warning" | "error" => {
  if (rank >= 6) return "error";
  if (rank >= 4) return "warning";
  if (rank >= 2) return "info";
  return "success";
};

const emptyFormData = {
  name: "",
  code: "",
  rank: "",
  description: "",
};

export function SeniorityLevelsTab() {
  const { selectedEntityId } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<string | null>(null);
  const [toast, setToast] = useState({ visible: false, type: "success" as ToastType, message: "" });
  const [formData, setFormData] = useState({ ...emptyFormData });
  const [editFormData, setEditFormData] = useState({ ...emptyFormData });
  const [page, setPage] = useState(0);
  const [deactivateConfirm, setDeactivateConfirm] = useState<{
    levelId: string;
    levelName: string;
  } | null>(null);

  const { data: seniorityLevels = [], isLoading } = useSeniorityLevels(
    selectedEntityId || undefined
  );
  const createSeniorityLevel = useCreateSeniorityLevel();
  const updateSeniorityLevel = useUpdateSeniorityLevel();
  const deleteSeniorityLevel = useDeleteSeniorityLevel();

  const total = seniorityLevels.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginatedLevels = useMemo(() => {
    const start = page * PAGE_SIZE;
    return seniorityLevels.slice(start, start + PAGE_SIZE);
  }, [seniorityLevels, page]);

  const isGlobal = (level: (typeof seniorityLevels)[0]) => !level.entity_id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rank = parseInt(formData.rank, 10);
    if (isNaN(rank) || rank < 0) {
      setToast({ visible: true, type: "error", message: "Rank must be a non-negative number." });
      return;
    }

    try {
      await createSeniorityLevel.mutateAsync({
        entity_id: selectedEntityId || null,
        name: formData.name,
        code: formData.code,
        rank,
        description: formData.description || undefined,
      });
      setToast({
        visible: true,
        type: "success",
        message: "Seniority level created successfully!",
      });
      setShowCreateForm(false);
      setFormData({ ...emptyFormData });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to create seniority level. Please try again.",
      });
      console.error(error);
    }
  };

  const handleStartEdit = (level: (typeof seniorityLevels)[0]) => {
    setEditingLevel(level.id);
    setEditFormData({
      name: level.name,
      code: level.code,
      rank: String(level.rank),
      description: level.description || "",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLevel) return;

    const rank = parseInt(editFormData.rank, 10);
    if (isNaN(rank) || rank < 0) {
      setToast({ visible: true, type: "error", message: "Rank must be a non-negative number." });
      return;
    }

    try {
      await updateSeniorityLevel.mutateAsync({
        levelId: editingLevel,
        data: {
          name: editFormData.name,
          code: editFormData.code,
          rank,
          description: editFormData.description || null,
        },
      });
      setToast({
        visible: true,
        type: "success",
        message: "Seniority level updated successfully!",
      });
      setEditingLevel(null);
      setEditFormData({ ...emptyFormData });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to update seniority level. Please try again.",
      });
      console.error(error);
    }
  };

  const handleDeactivate = (levelId: string, levelName: string) => {
    setDeactivateConfirm({ levelId, levelName });
  };

  const confirmDeactivate = async () => {
    if (!deactivateConfirm) return;
    try {
      await deleteSeniorityLevel.mutateAsync(deactivateConfirm.levelId);
      setToast({
        visible: true,
        type: "success",
        message: "Seniority level deactivated successfully!",
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to deactivate seniority level. Please try again.",
      });
      console.error(error);
    } finally {
      setDeactivateConfirm(null);
    }
  };

  const handleReactivate = async (levelId: string) => {
    try {
      await updateSeniorityLevel.mutateAsync({ levelId, data: { is_active: true } });
      setToast({
        visible: true,
        type: "success",
        message: "Seniority level reactivated successfully!",
      });
    } catch (error) {
      setToast({
        visible: true,
        type: "error",
        message: "Failed to reactivate seniority level. Please try again.",
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
          <h3 className="text-lg font-semibold text-text-primary">Seniority Levels</h3>
          <p className="text-sm text-text-secondary">
            Manage organizational hierarchy levels used to rank job roles
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Seniority Level
            </>
          )}
        </Button>
      </div>

      {/* Info Banner */}
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-info flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h4 className="font-semibold text-text-primary mb-1">How Seniority Levels Work</h4>
            <p className="text-sm text-text-secondary">
              Seniority levels define organizational hierarchy ranks (e.g., &quot;Junior&quot;,
              &quot;Senior&quot;, &quot;Director&quot;). Higher rank numbers indicate more senior
              positions. Global levels apply across all entities, while entity-scoped levels are
              specific to a single entity. Global levels are read-only from entity context.
            </p>
          </div>
        </div>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card variant="elevated" padding="lg" divided>
          <h4 className="text-base font-semibold text-text-primary mb-4">
            Create New Seniority Level
            {selectedEntityId && (
              <span className="text-sm font-normal text-text-secondary ml-2">(Entity-scoped)</span>
            )}
            {!selectedEntityId && (
              <span className="text-sm font-normal text-text-secondary ml-2">(Global)</span>
            )}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Level Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Senior Manager"
                required
              />
              <Input
                label="Level Code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., SR_MGR"
                required
              />
              <Input
                label="Rank (higher = more senior)"
                type="number"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                placeholder="e.g., 5"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe this seniority level..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
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
              <Button type="submit" variant="primary" loading={createSeniorityLevel.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Create Seniority Level
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Seniority Levels Table */}
      <div className="bg-white rounded-lg shadow-medium overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-text-secondary mt-2">Loading seniority levels...</p>
          </div>
        ) : seniorityLevels.length === 0 ? (
          <div className="p-8 text-center">
            <Award className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary mb-2">No seniority levels found</p>
            <p className="text-sm text-text-tertiary">
              Create your first seniority level to define organizational hierarchy
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-background-light border-b border-border-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Rank
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
                  {paginatedLevels.map((level) => {
                    const global = isGlobal(level);
                    return (
                      <tr key={level.id} className="hover:bg-background-light transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {level.name}
                            </span>
                            {global && (
                              <Badge variant="info" size="sm">
                                Global
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-text-secondary">
                            {level.code}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={getRankBadgeVariant(level.rank)} size="sm">
                            {level.rank}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          {level.description ? (
                            <p className="text-sm text-text-secondary truncate">
                              {level.description}
                            </p>
                          ) : (
                            <span className="text-sm text-text-tertiary italic">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={level.is_active ? "success" : "error"} size="sm">
                            {level.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          {global ? (
                            <span className="text-sm text-text-tertiary italic">Read-only</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStartEdit(level)}
                                className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                title="Edit seniority level"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {level.is_active ? (
                                <button
                                  onClick={() => handleDeactivate(level.id, level.name)}
                                  className="p-2 rounded-lg text-status-error hover:bg-status-error/10 transition-colors"
                                  title="Deactivate seniority level"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleReactivate(level.id)}
                                  className="p-2 rounded-lg text-status-success hover:bg-status-success/10 transition-colors"
                                  title="Activate seniority level"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-text-secondary">
                  Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, total)} of{" "}
                  {total} levels
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

      {/* Edit Modal */}
      {editingLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-text-primary">Edit Seniority Level</h4>
              <button
                onClick={() => {
                  setEditingLevel(null);
                  setEditFormData({ ...emptyFormData });
                }}
                className="p-1.5 rounded-lg text-text-tertiary hover:bg-background-light transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Input
                label="Level Name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
              <Input
                label="Level Code"
                type="text"
                value={editFormData.code}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })
                }
                required
              />
              <Input
                label="Rank (higher = more senior)"
                type="number"
                value={editFormData.rank}
                onChange={(e) => setEditFormData({ ...editFormData, rank: e.target.value })}
                required
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe this seniority level..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingLevel(null);
                    setEditFormData({ ...emptyFormData });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={updateSeniorityLevel.isPending}>
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
        title="Deactivate Seniority Level"
        message={`Are you sure you want to deactivate "${deactivateConfirm?.levelName || ""}"? Job roles using this level will retain their current assignment.`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivateConfirm(null)}
      />
    </div>
  );
}
