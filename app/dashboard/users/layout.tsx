"use client";

/**
 * Users Section Layout
 *
 * Provides tab-based navigation for user management functionality:
 * - All Users: User list with search and filters
 * - Entity Access: Manage user entity access permissions
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/src/lib/theme";

const tabs = [
  {
    name: "All Users",
    href: "/dashboard/users",
    exact: true,
  },
  {
    name: "Entity Access",
    href: "/dashboard/users/entity-access",
    exact: false,
  },
];

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">User Management</h1>
        <p className="text-text-secondary mt-2">Manage users, roles, and permissions</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border-light">
        <nav className="flex space-x-8" aria-label="User management tabs">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "px-1 py-4 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-light"
                )}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}
