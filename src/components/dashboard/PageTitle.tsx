"use client";

/**
 * Page Title Component
 *
 * Renders page title, description, and optional CTA action inline within page content.
 * Used at the top of each page's content area.
 */

import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageTitle({ title, description, actions }: PageTitleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-heading font-bold text-text-primary truncate">{title}</h1>
        {description && <p className="text-text-secondary mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}
