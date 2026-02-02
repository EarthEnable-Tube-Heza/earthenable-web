"use client";

/**
 * Tasks Section Layout
 *
 * Provides tab-based navigation for task management functionality:
 * - All Tasks: Task list with search, filters, and CRUD operations
 * - Task Subjects: Manage task subjects and FormYoula form mappings
 */

import { SectionLayout, TabItem } from "@/src/components/ui";

const tabs: TabItem[] = [
  {
    label: "All Tasks",
    href: "/dashboard/tasks",
    exact: true,
  },
  {
    label: "Task Subjects",
    href: "/dashboard/tasks/subjects",
    exact: false,
  },
];

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionLayout
      title="Task Management"
      description="Manage tasks, assignments, and task subject configurations"
      tabs={tabs}
      tabsAriaLabel="Task management tabs"
      pathLabels={{ tasks: "Tasks", subjects: "Subjects" }}
    >
      {children}
    </SectionLayout>
  );
}
