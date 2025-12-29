/**
 * Sync Hooks
 *
 * React Query hooks for Salesforce and User sync data.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api/apiClient";

// Refresh intervals
const SYNC_STATS_REFRESH_INTERVAL = 60000; // 1 minute
const SYNC_HISTORY_REFRESH_INTERVAL = 30000; // 30 seconds

// ============================================================================
// Salesforce Sync Hooks
// ============================================================================

/**
 * Hook for fetching Salesforce sync history with pagination
 */
export function useSalesforceSyncHistory(
  page = 1,
  pageSize = 20,
  status?: string,
  syncType?: string,
  days?: number
) {
  return useQuery({
    queryKey: ["salesforce-sync-history", page, pageSize, status, syncType, days],
    queryFn: () => apiClient.getSalesforceSyncHistory(page, pageSize, status, syncType, days),
    refetchInterval: SYNC_HISTORY_REFRESH_INTERVAL,
    staleTime: SYNC_HISTORY_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook for fetching Salesforce sync statistics
 */
export function useSalesforceSyncStats(days = 7) {
  return useQuery({
    queryKey: ["salesforce-sync-stats", days],
    queryFn: () => apiClient.getSalesforceSyncStats(days),
    refetchInterval: SYNC_STATS_REFRESH_INTERVAL,
    staleTime: SYNC_STATS_REFRESH_INTERVAL - 5000,
  });
}

// ============================================================================
// User Sync Hooks
// ============================================================================

/**
 * Hook for fetching user sync sessions history with pagination
 */
export function useUserSyncSessions(
  page = 1,
  pageSize = 20,
  userId?: string,
  syncType?: string,
  success?: boolean,
  days?: number
) {
  return useQuery({
    queryKey: ["user-sync-sessions", page, pageSize, userId, syncType, success, days],
    queryFn: () => apiClient.getUserSyncSessions(page, pageSize, userId, syncType, success, days),
    refetchInterval: SYNC_HISTORY_REFRESH_INTERVAL,
    staleTime: SYNC_HISTORY_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook for fetching user sync states with pagination
 */
export function useUserSyncStates(
  page = 1,
  pageSize = 20,
  userId?: string,
  forceFullSync?: boolean
) {
  return useQuery({
    queryKey: ["user-sync-states", page, pageSize, userId, forceFullSync],
    queryFn: () => apiClient.getUserSyncStates(page, pageSize, userId, forceFullSync),
    refetchInterval: SYNC_STATS_REFRESH_INTERVAL,
    staleTime: SYNC_STATS_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook for fetching user sync statistics
 */
export function useUserSyncStats(days = 7) {
  return useQuery({
    queryKey: ["user-sync-stats", days],
    queryFn: () => apiClient.getUserSyncStats(days),
    refetchInterval: SYNC_STATS_REFRESH_INTERVAL,
    staleTime: SYNC_STATS_REFRESH_INTERVAL - 5000,
  });
}
