"use client";

/**
 * Server Monitoring Dashboard
 *
 * Admin-only page for monitoring server health, Salesforce sync status,
 * user activity, and system resources.
 */

import { Button } from "@/src/components/ui";
import { PagePermissionGuard } from "@/src/components/auth";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PageTitle } from "@/src/components/dashboard/PageTitle";
import { PAGE_SPACING } from "@/src/lib/theme";
import { useRefreshMonitoring } from "@/src/hooks/useMonitoring";
import {
  ServerHealthCard,
  SalesforceSyncCard,
  ActiveUsersCard,
  UserBreakdownCard,
  FeatureUsageCard,
  SystemResourcesCard,
  EndpointUsageCard,
  HierarchicalFeatureUsageCard,
} from "@/src/components/monitoring";

export default function MonitoringPage() {
  return (
    <PagePermissionGuard
      permissions={["system.monitoring", "system.admin"]}
      pageTitle="Server Monitoring"
      showUnauthorizedPage
    >
      <MonitoringContent />
    </PagePermissionGuard>
  );
}

function MonitoringContent() {
  const { refreshAll } = useRefreshMonitoring();

  useSetPageHeader({
    title: "Server Monitoring",
    pathLabels: { monitoring: "Monitoring" },
  });

  return (
    <div className={PAGE_SPACING}>
      {/* Page Title + CTA */}
      <PageTitle
        title="Server Monitoring"
        description="Real-time server health, sync status, and resource utilization"
        actions={
          <Button variant="outline" size="sm" onClick={refreshAll}>
            Refresh All
          </Button>
        }
      />

      {/* Top Row: Health, Sync, Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ServerHealthCard />
        <SalesforceSyncCard />
        <SystemResourcesCard />
      </div>

      {/* Middle Row: User Activity, User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveUsersCard />
        <UserBreakdownCard />
      </div>

      {/* Middle Row 2: Feature Usage and Endpoint Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureUsageCard days={7} />
        <EndpointUsageCard days={7} />
      </div>

      {/* Bottom Row: Hierarchical Feature Usage (Full Width) */}
      <HierarchicalFeatureUsageCard days={7} />
    </div>
  );
}
