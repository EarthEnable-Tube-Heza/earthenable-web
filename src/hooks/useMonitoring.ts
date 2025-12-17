/**
 * React Query hooks for server monitoring
 *
 * These hooks provide auto-refreshing data for the monitoring dashboard.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api/apiClient";

// Refresh intervals in milliseconds
const HEALTH_REFRESH_INTERVAL = 30 * 1000; // 30 seconds
const SYNC_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const USER_ACTIVITY_REFRESH_INTERVAL = 60 * 1000; // 1 minute
const FEATURE_USAGE_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const RESOURCES_REFRESH_INTERVAL = 30 * 1000; // 30 seconds

/**
 * Hook to fetch server health status
 * Auto-refreshes every 30 seconds
 */
export function useServerHealth() {
  return useQuery({
    queryKey: ["monitoring", "health"],
    queryFn: () => apiClient.getMonitoringHealth(),
    refetchInterval: HEALTH_REFRESH_INTERVAL,
    staleTime: HEALTH_REFRESH_INTERVAL - 5000, // Consider stale 5s before refresh
  });
}

/**
 * Hook to fetch Salesforce sync status and history
 * Auto-refreshes every 5 minutes
 */
export function useSalesforceSyncStatus(limit = 10) {
  return useQuery({
    queryKey: ["monitoring", "salesforce-sync", limit],
    queryFn: () => apiClient.getMonitoringSyncStatus(limit),
    refetchInterval: SYNC_REFRESH_INTERVAL,
    staleTime: SYNC_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook to fetch user activity statistics
 * Auto-refreshes every 1 minute
 */
export function useUserActivityStats() {
  return useQuery({
    queryKey: ["monitoring", "user-activity"],
    queryFn: () => apiClient.getMonitoringUserActivity(),
    refetchInterval: USER_ACTIVITY_REFRESH_INTERVAL,
    staleTime: USER_ACTIVITY_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook to fetch feature usage statistics
 * Auto-refreshes every 5 minutes
 */
export function useFeatureUsage(days = 7) {
  return useQuery({
    queryKey: ["monitoring", "feature-usage", days],
    queryFn: () => apiClient.getMonitoringFeatureUsage(days),
    refetchInterval: FEATURE_USAGE_REFRESH_INTERVAL,
    staleTime: FEATURE_USAGE_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook to fetch system resource utilization
 * Auto-refreshes every 30 seconds
 */
export function useSystemResources() {
  return useQuery({
    queryKey: ["monitoring", "resources"],
    queryFn: () => apiClient.getMonitoringResources(),
    refetchInterval: RESOURCES_REFRESH_INTERVAL,
    staleTime: RESOURCES_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook to manually refresh all monitoring data
 */
export function useRefreshMonitoring() {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    },
    refreshHealth: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "health"] });
    },
    refreshSyncStatus: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "salesforce-sync"] });
    },
    refreshUserActivity: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "user-activity"] });
    },
    refreshFeatureUsage: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "feature-usage"] });
    },
    refreshResources: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "resources"] });
    },
  };
}
