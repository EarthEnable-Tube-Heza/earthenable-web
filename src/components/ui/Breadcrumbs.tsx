"use client";

/**
 * Breadcrumbs Component
 *
 * Navigation breadcrumbs for showing page hierarchy.
 * Supports both static breadcrumbs and auto-generated from pathname.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/theme";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  /** Static breadcrumb items (overrides auto-generation) */
  items?: BreadcrumbItem[];
  /** Whether to show home icon as first item */
  showHome?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom labels for path segments (e.g., { "call-center": "Call Center" }) */
  pathLabels?: Record<string, string>;
}

/** Default path segment labels */
const DEFAULT_PATH_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  tasks: "Tasks",
  analytics: "Analytics",
  expenses: "Expenses",
  sms: "SMS",
  "call-center": "Call Center",
  settings: "Settings",
  subjects: "Subjects",
  callbacks: "Callbacks",
  history: "History",
  mobile: "Mobile App",
  "entity-access": "Entity Access",
  permissions: "Permissions",
  "role-permissions": "Role Mappings",
};

/**
 * Convert path segment to display label
 */
function getSegmentLabel(segment: string, pathLabels?: Record<string, string>): string {
  // Check custom labels first
  if (pathLabels?.[segment]) {
    return pathLabels[segment];
  }

  // Check default labels
  if (DEFAULT_PATH_LABELS[segment]) {
    return DEFAULT_PATH_LABELS[segment];
  }

  // Convert kebab-case or snake_case to Title Case
  return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbs(
  pathname: string,
  pathLabels?: Record<string, string>
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip dashboard in breadcrumbs since it's the home
    if (segment === "dashboard" && i === 0) {
      continue;
    }

    const isLast = i === segments.length - 1;

    breadcrumbs.push({
      label: getSegmentLabel(segment, pathLabels),
      href: isLast ? undefined : currentPath,
    });
  }

  return breadcrumbs;
}

export function Breadcrumbs({ items, showHome = true, className, pathLabels }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Use provided items or auto-generate from pathname
  const breadcrumbs = items ?? generateBreadcrumbs(pathname, pathLabels);

  if (breadcrumbs.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1 text-sm">
        {/* Home Link */}
        {showHome && (
          <li className="flex items-center">
            <Link
              href="/dashboard"
              className="text-text-secondary hover:text-text-primary transition-colors p-1 -m-1 rounded hover:bg-background-light"
              aria-label="Dashboard home"
            >
              <Home className="w-4 h-4" />
            </Link>
            {breadcrumbs.length > 0 && <ChevronRight className="w-4 h-4 text-text-disabled mx-1" />}
          </li>
        )}

        {/* Breadcrumb Items */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? "text-text-primary font-medium" : "text-text-secondary")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="w-4 h-4 text-text-disabled mx-1" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
