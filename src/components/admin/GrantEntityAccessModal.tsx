"use client";

/**
 * Grant Entity Access Modal Component
 *
 * Modal dialog for granting entity access to a user.
 * Supports both single and bulk entity grants with optional notes.
 */

import { useState } from "react";
import { apiClient } from "@/src/lib/api/apiClient";
import { UserWithEntityAccess, EntityListResponse } from "@/src/types";
import { Button, Alert } from "@/src/components/ui";

interface GrantEntityAccessModalProps {
  user: UserWithEntityAccess;
  entities: EntityListResponse[];
  onClose: (success: boolean) => void;
}

export function GrantEntityAccessModal({ user, entities, onClose }: GrantEntityAccessModalProps) {
  const [selectedEntityIds, setSelectedEntityIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get entities user doesn't already have access to
  const availableEntities = entities.filter(
    (entity) =>
      !user.entity_access.some((access) => access.entity_id === entity.id && access.is_active)
  );

  // Handle entity selection toggle
  const toggleEntity = (entityId: string) => {
    setSelectedEntityIds((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
    );
  };

  // Handle grant access
  const handleGrant = async () => {
    if (selectedEntityIds.length === 0) {
      setError("Please select at least one entity");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedEntityIds.length === 1) {
        // Single entity grant
        await apiClient.grantEntityAccess(user.id, {
          entity_id: selectedEntityIds[0],
          notes: notes || undefined,
        });
      } else {
        // Bulk grant
        await apiClient.bulkGrantEntityAccess(user.id, {
          entity_ids: selectedEntityIds,
          notes: notes || undefined,
        });
      }

      // Success - close modal with success flag
      onClose(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant access");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-light">
          <h2 className="text-2xl font-heading text-text-primary">Grant Entity Access</h2>
          <p className="text-sm text-text-secondary mt-1">{user.name || user.email}</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Current Access */}
          {user.entity_access.filter((a) => a.is_active).length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-text-primary mb-2">Current Entity Access</h3>
              <div className="flex flex-wrap gap-2">
                {user.entity_access
                  .filter((access) => access.is_active)
                  .map((access) => (
                    <span
                      key={access.id}
                      className="px-3 py-1 bg-background-light border border-border-light rounded text-sm"
                    >
                      {access.entity_code} - {access.entity_name}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Available Entities */}
          <div className="mb-6">
            <h3 className="font-semibold text-text-primary mb-3">Select Entities to Grant</h3>

            {availableEntities.length === 0 ? (
              <p className="text-text-secondary italic">User already has access to all entities</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableEntities.map((entity) => (
                  <label
                    key={entity.id}
                    className="flex items-center gap-3 p-3 border border-border-light rounded hover:bg-background-light cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEntityIds.includes(entity.id)}
                      onChange={() => toggleEntity(entity.id)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-text-primary">
                        {entity.code} - {entity.name}
                      </div>
                      {entity.is_parent && (
                        <div className="text-xs text-warning mt-1">
                          Parent Entity (Global Access)
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary">{entity.user_count} users</div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this access grant..."
              rows={3}
              className="w-full px-3 py-2 border border-border-light rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Selected Count */}
          {selectedEntityIds.length > 0 && (
            <div className="text-sm text-text-secondary">
              {selectedEntityIds.length} {selectedEntityIds.length === 1 ? "entity" : "entities"}{" "}
              selected
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-light flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onClose(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGrant}
            loading={loading}
            disabled={selectedEntityIds.length === 0 || loading}
          >
            {loading ? "Granting..." : "Grant Access"}
          </Button>
        </div>
      </div>
    </div>
  );
}
