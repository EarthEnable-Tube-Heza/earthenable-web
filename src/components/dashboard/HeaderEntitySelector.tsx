"use client";

/**
 * Header Entity Selector Component
 *
 * Displays entity selection in header Row 2 using a standard Select dropdown.
 * All users (single or multi-entity) see the same Select dropdown for consistency.
 * Uses global auth context for entity state persistence.
 */

import { useAuth } from "@/src/lib/auth";
import { Select } from "@/src/components/ui";

export function HeaderEntitySelector() {
  const { entityInfo, selectedEntityId, selectEntity } = useAuth();

  if (!entityInfo) return null;

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const entityId = e.target.value;
    if (entityId) {
      try {
        await selectEntity(entityId);
      } catch (error) {
        console.error("Failed to switch entity:", error);
      }
    }
  };

  return (
    <Select value={selectedEntityId || ""} onChange={handleChange} className="w-48">
      <option value="">Select Entity</option>
      {entityInfo.accessible_entities.map((entity) => (
        <option key={entity.id} value={entity.id}>
          {entity.name} ({entity.code})
        </option>
      ))}
    </Select>
  );
}
