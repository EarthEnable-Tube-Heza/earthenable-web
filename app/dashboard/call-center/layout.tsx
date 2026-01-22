"use client";

/**
 * Call Center Section Layout
 *
 * Provides tab-based navigation for call center functionality:
 * - Workspace: Main softphone interface with dialpad and call controls
 * - Callbacks: Scheduled callback management
 * - History: Call logs and history
 * - Settings: Voice service configuration
 */

import { SectionLayout, TabItem } from "@/src/components/ui";

const tabs: TabItem[] = [
  {
    label: "Workspace",
    href: "/dashboard/call-center",
    exact: true,
  },
  {
    label: "Callbacks",
    href: "/dashboard/call-center/callbacks",
    exact: false,
  },
  {
    label: "History",
    href: "/dashboard/call-center/history",
    exact: false,
  },
  {
    label: "Settings",
    href: "/dashboard/call-center/settings",
    exact: false,
  },
];

export default function CallCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <SectionLayout
      title="Call Center"
      description="Manage calls, callbacks, and voice service settings"
      tabs={tabs}
      tabsAriaLabel="Call center tabs"
      pathLabels={{
        "call-center": "Call Center",
        callbacks: "Callbacks",
        history: "History",
        settings: "Settings",
      }}
    >
      {children}
    </SectionLayout>
  );
}
