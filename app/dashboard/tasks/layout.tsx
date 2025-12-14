"use client";

/**
 * Tasks Section Layout
 *
 * Provides tab-based navigation for task management functionality:
 * - All Tasks: Task list with search, filters, and CRUD operations
 * - Task Subjects: Manage task subjects and FormYoula form mappings
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/src/lib/theme";

const tabs = [
  {
    name: "All Tasks",
    href: "/dashboard/tasks",
    exact: true,
  },
  {
    name: "Task Subjects",
    href: "/dashboard/tasks/subjects",
    exact: false,
  },
];

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-text-primary">Task Management</h1>
        <p className="text-text-secondary mt-2">
          Manage tasks, assignments, and task subject configurations
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border-light">
        <nav className="flex space-x-8" aria-label="Task management tabs">
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
