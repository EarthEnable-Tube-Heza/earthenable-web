"use client";

/**
 * TabNavigation Component
 *
 * Horizontal tab navigation with consistent styling.
 * Supports permission-based tab visibility and icons.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/theme";
import { LucideIcon } from "lucide-react";
import { usePermissions } from "@/src/lib/auth";

export interface TabItem {
  /** Tab label */
  label: string;
  /** Tab href */
  href: string;
  /** Whether to match href exactly (default: true for root path, false otherwise) */
  exact?: boolean;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Required permissions to see this tab */
  requiredPermissions?: string[];
  /** Whether tab is disabled */
  disabled?: boolean;
  /** Badge content (e.g., count) */
  badge?: string | number;
}

export interface TabNavigationProps {
  /** Tab items */
  tabs: TabItem[];
  /** Aria label for navigation */
  ariaLabel?: string;
  /** Custom class name */
  className?: string;
  /** Tab size variant */
  size?: "sm" | "md" | "lg";
}

export function TabNavigation({
  tabs,
  ariaLabel = "Tab navigation",
  className,
  size = "md",
}: TabNavigationProps) {
  const pathname = usePathname();
  const { hasAnyPermission } = usePermissions();

  // Filter tabs based on permissions
  const visibleTabs = tabs.filter((tab) => {
    // Check permission-based access
    if (tab.requiredPermissions && tab.requiredPermissions.length > 0) {
      if (!hasAnyPermission(tab.requiredPermissions)) {
        return false;
      }
    }

    return true;
  });

  if (visibleTabs.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs py-2",
    md: "text-sm py-3",
    lg: "text-base py-4",
  };

  return (
    <div className={cn("border-b border-border-light", className)}>
      <nav className="flex space-x-6" aria-label={ariaLabel}>
        {visibleTabs.map((tab) => {
          // Determine if tab is active based on current pathname
          const isExactMatch = pathname === tab.href;
          const isPathMatch = pathname.startsWith(tab.href + "/");
          const shouldBeActive = tab.exact === true ? isExactMatch : isExactMatch || isPathMatch;

          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.disabled ? "#" : tab.href}
              className={cn(
                "flex items-center gap-2 px-1 font-medium border-b-2 transition-colors whitespace-nowrap",
                sizeClasses[size],
                shouldBeActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-light",
                tab.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
              aria-current={shouldBeActive ? "page" : undefined}
              onClick={(e) => tab.disabled && e.preventDefault()}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full",
                    shouldBeActive
                      ? "bg-primary/10 text-primary"
                      : "bg-background-light text-text-secondary"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
