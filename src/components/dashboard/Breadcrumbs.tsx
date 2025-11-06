'use client';

/**
 * Breadcrumbs Component
 *
 * Displays hierarchical navigation breadcrumbs.
 * Automatically generates breadcrumbs from current pathname.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { cn } from '@/src/lib/theme';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Home',
  users: 'Users',
  forms: 'Forms',
  analytics: 'Analytics',
  components: 'Components',
  settings: 'Settings',
  profile: 'Profile',
};

export function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Split pathname into segments
    const segments = pathname.split('/').filter(Boolean);

    // Build breadcrumb items
    const items: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Get label from mapping or use segment as-is
      const label = routeLabels[segment] || segment;

      // Skip if it's an ID (numeric or UUID-like)
      const isId = /^[0-9a-fA-F-]{20,}$/.test(segment) || /^\d+$/.test(segment);

      if (!isId) {
        items.push({
          label: label.charAt(0).toUpperCase() + label.slice(1),
          href: currentPath,
        });
      }
    });

    return items;
  }, [pathname]);

  // Don't show breadcrumbs on root dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center text-sm text-text-secondary mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 mx-2 text-text-disabled"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span className="font-medium text-text-primary">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'hover:text-primary transition-colors',
                    'focus:outline-none focus:text-primary'
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
