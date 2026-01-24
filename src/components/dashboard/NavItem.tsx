"use client";

/**
 * NavItem Component
 *
 * Single navigation item with icon, label, optional badge, and tooltip support.
 * Handles active state highlighting and collapsed sidebar tooltip display.
 */

import Link from "next/link";
import { cn } from "@/src/lib/theme";
import type { NavItemProps } from "@/src/types";

export function NavItem({ item, isCollapsed, isActive, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg font-body transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          "group relative",
          isActive ? "bg-primary text-white" : "text-text-primary hover:bg-background-light",
          isCollapsed && "justify-center px-2",
          item.disabled && "opacity-50 pointer-events-none"
        )}
        title={isCollapsed ? item.label : undefined}
        aria-current={isActive ? "page" : undefined}
        aria-disabled={item.disabled}
      >
        {/* Icon */}
        <Icon
          className={cn(
            "flex-shrink-0 w-5 h-5",
            isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"
          )}
        />

        {/* Label */}
        {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

        {/* Badge */}
        {item.badge !== undefined && !isCollapsed && (
          <span
            className={cn(
              "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
              isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
            )}
          >
            {item.badge}
          </span>
        )}

        {/* Tooltip for collapsed sidebar */}
        {isCollapsed && (
          <div
            className={cn(
              "absolute left-full ml-2 px-2 py-1 rounded-md bg-secondary text-white text-xs",
              "whitespace-nowrap opacity-0 pointer-events-none",
              "group-hover:opacity-100 transition-opacity z-50"
            )}
            role="tooltip"
          >
            {item.label}
            {item.badge !== undefined && (
              <span className="ml-2 px-1.5 py-0.5 rounded bg-white/20">{item.badge}</span>
            )}
          </div>
        )}
      </Link>
    </li>
  );
}
