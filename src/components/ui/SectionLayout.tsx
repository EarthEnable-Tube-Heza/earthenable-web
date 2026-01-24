"use client";

/**
 * SectionLayout Component
 *
 * Standardized layout for dashboard sections with:
 * - Page header data (set via context to unified header)
 * - Optional tab navigation
 * - Content area
 *
 * Use this component for consistent layouts across all dashboard sections.
 */

import { ReactNode } from "react";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PageTitle } from "@/src/components/dashboard/PageTitle";
import { TabNavigation, TabItem } from "./TabNavigation";
import { BreadcrumbItem } from "./Breadcrumbs";
import { cn, PAGE_SPACING } from "@/src/lib/theme";

export interface SectionLayoutProps {
  /** Section title (shown in unified header) */
  title: string;
  /** Section description (shown in unified header) */
  description?: string;
  /** Custom breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
  /** Custom labels for auto-generated breadcrumb path segments */
  pathLabels?: Record<string, string>;
  /** Action buttons/elements to display in unified header */
  actions?: ReactNode;
  /** Tab items for horizontal navigation */
  tabs?: TabItem[];
  /** Aria label for tab navigation */
  tabsAriaLabel?: string;
  /** Page content */
  children: ReactNode;
  /** Custom class name for the wrapper */
  className?: string;
  /** Custom class name for the content area */
  contentClassName?: string;
  /** Whether to add spacing between tabs and content */
  contentSpacing?: "none" | "sm" | "md" | "lg";
  /** @deprecated No longer used - breadcrumbs are auto-generated in header */
  showBreadcrumbs?: boolean;
}

export function SectionLayout({
  title,
  description,
  breadcrumbs,
  pathLabels,
  actions,
  tabs,
  tabsAriaLabel,
  children,
  className,
  contentClassName,
  contentSpacing = "md",
}: SectionLayoutProps) {
  const spacingClasses = {
    none: "",
    sm: "mt-4",
    md: "mt-6",
    lg: "mt-8",
  };

  useSetPageHeader({
    title,
    description,
    actions,
    breadcrumbs,
    pathLabels,
  });

  return (
    <div className={cn(PAGE_SPACING, className)}>
      {/* Page Title + Description + Actions */}
      <PageTitle title={title} description={description} actions={actions} />

      {/* Tab Navigation */}
      {tabs && tabs.length > 0 && (
        <TabNavigation tabs={tabs} ariaLabel={tabsAriaLabel || `${title} tabs`} />
      )}

      {/* Content */}
      <div className={cn(spacingClasses[contentSpacing], contentClassName)}>{children}</div>
    </div>
  );
}
