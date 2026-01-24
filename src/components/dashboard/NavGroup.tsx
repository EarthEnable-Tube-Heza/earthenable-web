"use client";

/**
 * NavGroup Component
 *
 * Collapsible navigation module group with icon, label, and nested items.
 * Features:
 * - Collapsible with chevron icon
 * - Auto-expand when child is active
 * - Icon-only display when sidebar is collapsed
 * - Tooltip support when collapsed
 */

import { useEffect, useCallback } from "react";
import { cn } from "@/src/lib/theme";
import { ChevronDown, ChevronRight } from "@/src/components/icons";
import { NavItem } from "./NavItem";
import type { NavGroupProps } from "@/src/types";

export function NavGroup({
  module,
  isCollapsed,
  isExpanded,
  onToggleExpanded,
  pathname,
}: NavGroupProps) {
  const ModuleIcon = module.icon;

  // Check if any item in this module is active
  const hasActiveItem = module.items.some((item) => {
    return pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
  });

  // Auto-expand when a child is active
  useEffect(() => {
    if (hasActiveItem && !isExpanded) {
      onToggleExpanded(module.id);
    }
    // Only run when hasActiveItem changes to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasActiveItem, module.id]);

  // Toggle handler
  const handleToggle = useCallback(() => {
    onToggleExpanded(module.id);
  }, [module.id, onToggleExpanded]);

  // For single-item modules, render as a direct nav item
  if (module.items.length === 1) {
    const item = module.items[0];
    const isActive =
      pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

    return (
      <NavItem item={item} isCollapsed={isCollapsed} isActive={isActive} onClick={undefined} />
    );
  }

  // When sidebar is collapsed, show only the module icon
  if (isCollapsed) {
    return (
      <li className="relative group">
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center justify-center w-full p-2.5 rounded-lg",
            "text-text-secondary hover:bg-background-light hover:text-text-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary",
            "transition-colors",
            hasActiveItem && "bg-primary/10 text-primary"
          )}
          aria-label={module.label}
          aria-expanded={isExpanded}
        >
          <ModuleIcon className="w-5 h-5" />
        </button>

        {/* Flyout menu for collapsed sidebar */}
        <div
          className={cn(
            "absolute left-full top-0 pl-2 min-w-[180px]",
            "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
            "transition-opacity z-50"
          )}
        >
          <div className="py-2 px-2 bg-white rounded-lg shadow-lg border border-border-light">
            {/* Module header in flyout */}
            <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              {module.label}
            </div>

            {/* Items */}
            <ul className="space-y-1">
              {module.items.map((item) => {
                const isItemActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <NavItem
                    key={item.id}
                    item={item}
                    isCollapsed={false}
                    isActive={isItemActive}
                    onClick={undefined}
                  />
                );
              })}
            </ul>
          </div>
        </div>
      </li>
    );
  }

  // Full expanded sidebar view
  return (
    <li>
      {/* Module header - clickable to expand/collapse */}
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center w-full gap-3 px-3 py-2 rounded-lg",
          "text-text-secondary hover:bg-background-light hover:text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "transition-colors",
          hasActiveItem && "text-text-primary font-medium"
        )}
        aria-expanded={isExpanded}
        aria-controls={`nav-group-${module.id}`}
      >
        <ModuleIcon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium flex-1 text-left">{module.label}</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-muted" />
        )}
      </button>

      {/* Collapsible items */}
      <ul
        id={`nav-group-${module.id}`}
        className={cn(
          "mt-1 ml-4 pl-4 pr-1 border-l border-border-light space-y-1",
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-96 opacity-100 py-1" : "max-h-0 opacity-0 py-0"
        )}
      >
        {module.items.map((item) => {
          const isItemActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <NavItem
              key={item.id}
              item={item}
              isCollapsed={false}
              isActive={isItemActive}
              onClick={undefined}
            />
          );
        })}
      </ul>
    </li>
  );
}
