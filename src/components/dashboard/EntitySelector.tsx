"use client";

/**
 * Entity Selector Component
 *
 * Displays current entity for all users.
 * - Single-entity users: Shows entity name (static display)
 * - Multi-entity users: Shows entity name with dropdown to switch
 */

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/src/lib/auth";
import { cn } from "@/src/lib/theme";

export function EntitySelector() {
  const { entityInfo, selectedEntityId, selectEntity } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't show if no entity info
  if (!entityInfo) {
    return null;
  }

  const currentEntity = entityInfo.accessible_entities.find((e) => e.id === selectedEntityId);
  const isMultiEntity = entityInfo.is_multi_entity_user;

  const handleSelectEntity = async (entityId: string) => {
    setIsOpen(false);
    try {
      await selectEntity(entityId);
    } catch (error) {
      console.error("Failed to switch entity:", error);
    }
  };

  return (
    <div className="p-4 border-t border-border-light bg-white" ref={dropdownRef}>
      {/* Current Entity Display */}
      {isMultiEntity ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg",
            "bg-background-light hover:bg-border-light transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary"
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-heading font-bold flex-shrink-0 text-sm">
              {currentEntity?.code.slice(0, 2).toUpperCase() || "??"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-text-secondary font-medium">Current Entity</p>
              <p className="text-sm font-semibold text-text-primary truncate">
                {currentEntity?.name || "Select Entity"}
              </p>
            </div>
          </div>
          <svg
            className={cn(
              "w-5 h-5 text-text-secondary transition-transform flex-shrink-0",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-background-light">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-heading font-bold flex-shrink-0 text-sm">
              {currentEntity?.code.slice(0, 2).toUpperCase() || "??"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-text-secondary font-medium">Entity</p>
              <p className="text-sm font-semibold text-text-primary truncate">
                {currentEntity?.name || "No Entity"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown - Only show for multi-entity users */}
      {isMultiEntity && isOpen && (
        <div className="mt-2 py-2 bg-white border border-border-light rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {entityInfo.accessible_entities.map((entity) => (
            <button
              key={entity.id}
              onClick={() => handleSelectEntity(entity.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-left",
                "hover:bg-background-light transition-colors",
                entity.id === selectedEntityId && "bg-primary/10"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-heading font-bold text-xs flex-shrink-0",
                  entity.id === selectedEntityId
                    ? "bg-primary text-white"
                    : "bg-background-light text-text-secondary"
                )}
              >
                {entity.code.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    entity.id === selectedEntityId ? "text-primary" : "text-text-primary"
                  )}
                >
                  {entity.name}
                </p>
                <p className="text-xs text-text-secondary">{entity.code}</p>
              </div>
              {entity.id === selectedEntityId && (
                <svg
                  className="w-5 h-5 text-primary flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
