"use client";

/**
 * Server Monitoring Dashboard
 *
 * Admin-only page for monitoring server health, Salesforce sync status,
 * user activity, and system resources.
 */

import { useRequireAdmin } from "@/src/lib/auth";
import { Button } from "@/src/components/ui";
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
  // Require admin role to access this page
  const { isLoading: isAuthLoading } = useRequireAdmin();
  const { refreshAll } = useRefreshMonitoring();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Server Monitoring</h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time server health, sync status, and resource utilization
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshAll}>
          Refresh All
        </Button>
      </div>

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
