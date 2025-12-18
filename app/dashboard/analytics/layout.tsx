"use client";

/**
 * Analytics Layout
 *
 * Layout wrapper for analytics pages with horizontal tab navigation.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/theme";

interface TabItem {
  href: string;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  {
    href: "/dashboard/analytics",
    label: "User Analytics",
    icon: "👥",
  },
  {
    href: "/dashboard/analytics/mobile",
    label: "Mobile App",
    icon: "📱",
  },
];

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Horizontal Tab Navigation */}
      <div className="border-b border-border-light">
        <nav className="flex space-x-8" aria-label="Analytics tabs">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/dashboard/analytics"
                ? pathname === tab.href
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-medium"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
