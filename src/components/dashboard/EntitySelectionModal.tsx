"use client";

/**
 * Entity Selection Modal
 *
 * Forces multi-entity users to explicitly select an entity after login.
 * Prevents accidental actions on wrong entity.
 */

import { useState } from "react";
import { useAuth } from "@/src/lib/auth";
import { cn } from "@/src/lib/theme";
import { EntityResponse } from "@/src/types";

export function EntitySelectionModal() {
  const { entityInfo, selectedEntityId, selectEntity } = useAuth();
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show modal if user has entities but hasn't selected one
  const shouldShow =
    entityInfo &&
    entityInfo.is_multi_entity_user &&
    !selectedEntityId &&
    entityInfo.accessible_entities.length > 0;

  if (!shouldShow) {
    return null;
  }

  const handleSelectEntity = async (entity: EntityResponse) => {
    setIsSelecting(true);
    setError(null);

    try {
      await selectEntity(entity.id);
      // Modal will auto-hide when selectedEntityId is set
    } catch (err) {
      console.error("Failed to select entity:", err);
      setError("Failed to select entity. Please try again.");
      setIsSelecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-border-light bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
              Select Your Entity
            </h2>
            <p className="text-text-secondary text-sm">
              You have access to multiple entities. Please select the entity you want to work with.
            </p>
          </div>
        </div>

        {/* Entity Cards Grid */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entityInfo.accessible_entities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => handleSelectEntity(entity)}
                disabled={isSelecting}
                className={cn(
                  "p-6 rounded-xl border-2 transition-all duration-200",
                  "hover:border-primary hover:shadow-lg hover:scale-[1.02]",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "border-border-light bg-white"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Entity Icon */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-heading font-bold text-xl flex-shrink-0 shadow-md">
                    {entity.code.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Entity Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="text-lg font-heading font-bold text-text-primary mb-1 truncate">
                      {entity.name}
                    </h3>
                    <p className="text-sm text-text-secondary mb-2">{entity.code}</p>
                    {entity.is_parent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        Parent Entity
                      </span>
                    )}
                  </div>
                </div>

                {/* Select Arrow */}
                <div className="mt-4 flex items-center justify-end text-primary">
                  <span className="text-sm font-medium mr-2">Select</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isSelecting && (
            <div className="mt-6 flex items-center justify-center gap-2 text-text-secondary">
              <svg
                className="animate-spin h-5 w-5 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm">Selecting entity...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-light bg-background-light">
          <p className="text-xs text-text-secondary text-center">
            You can switch entities later using the entity selector in the sidebar.
          </p>
        </div>
      </div>
    </div>
  );
}
