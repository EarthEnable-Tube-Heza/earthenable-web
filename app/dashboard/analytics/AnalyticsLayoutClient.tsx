"use client";

/**
 * Analytics Layout (Client Component)
 *
 * Layout wrapper for analytics pages with horizontal tab navigation.
 */

import { SectionLayout, TabItem } from "@/src/components/ui";

const tabs: TabItem[] = [
  {
    label: "User Analytics",
    href: "/dashboard/analytics",
    exact: true,
  },
  {
    label: "Mobile App",
    href: "/dashboard/analytics/mobile",
    exact: false,
  },
];

export default function AnalyticsLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SectionLayout
      title="Analytics Dashboard"
      description="User statistics and insights"
      tabs={tabs}
      tabsAriaLabel="Analytics tabs"
      pathLabels={{ analytics: "Analytics", mobile: "Mobile App" }}
      showBreadcrumbs={true}
    >
      {children}
    </SectionLayout>
  );
}
