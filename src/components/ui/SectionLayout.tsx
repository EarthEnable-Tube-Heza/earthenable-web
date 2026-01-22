"use client";

/**
 * SectionLayout Component
 *
 * Standardized layout for dashboard sections with:
 * - Breadcrumbs
 * - Page header (title + description)
 * - Optional tab navigation
 * - Content area
 *
 * Use this component for consistent layouts across all dashboard sections.
 */

import { ReactNode } from "react";
import { PageHeader, PageHeaderProps } from "./PageHeader";
import { TabNavigation, TabItem } from "./TabNavigation";
import { cn } from "@/src/lib/theme";

export interface SectionLayoutProps extends Omit<PageHeaderProps, "children"> {
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
  /** Whether to add spacing between header/tabs and content */
  contentSpacing?: "none" | "sm" | "md" | "lg";
}

export function SectionLayout({
  title,
  description,
  breadcrumbs,
  showBreadcrumbs = true,
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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Page Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        showBreadcrumbs={showBreadcrumbs}
        pathLabels={pathLabels}
        actions={actions}
      />

      {/* Tab Navigation */}
      {tabs && tabs.length > 0 && (
        <TabNavigation tabs={tabs} ariaLabel={tabsAriaLabel || `${title} tabs`} />
      )}

      {/* Content */}
      <div className={cn(spacingClasses[contentSpacing], contentClassName)}>{children}</div>
    </div>
  );
}
