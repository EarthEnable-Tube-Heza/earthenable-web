"use client";

/**
 * PageHeader Component
 *
 * Standardized page header with title, description, breadcrumbs, and optional actions.
 * Use this component for consistent headers across all dashboard pages.
 */

import { ReactNode } from "react";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";
import { cn } from "@/src/lib/theme";

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Custom breadcrumb items (auto-generated from pathname if not provided) */
  breadcrumbs?: BreadcrumbItem[];
  /** Whether to show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Custom labels for auto-generated breadcrumb path segments */
  pathLabels?: Record<string, string>;
  /** Action buttons/elements to display on the right */
  actions?: ReactNode;
  /** Additional content below title (e.g., entity selector) */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  showBreadcrumbs = true,
  pathLabels,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <Breadcrumbs items={breadcrumbs} pathLabels={pathLabels} className="mb-2" />
      )}

      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-heading font-bold text-text-primary truncate">{title}</h1>
          {description && <p className="text-text-secondary mt-1">{description}</p>}
        </div>

        {/* Actions */}
        {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
      </div>

      {/* Additional Content */}
      {children}
    </div>
  );
}
