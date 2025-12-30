/**
 * Notification Hooks
 *
 * React Query hooks for admin notification management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api/apiClient";
import { NotificationFilters, SendNotificationRequest } from "@/src/types/notification";

// Refresh intervals
const NOTIFICATIONS_REFRESH_INTERVAL = 30000; // 30 seconds
const STATS_REFRESH_INTERVAL = 60000; // 1 minute

// Query keys
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, "detail"] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  stats: (days: number) => [...notificationKeys.all, "stats", days] as const,
};

// ============================================================================
// List & Stats Hooks
// ============================================================================

/**
 * Hook for fetching paginated notifications with filters
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters || {}),
    queryFn: () => apiClient.getNotifications(filters),
    refetchInterval: NOTIFICATIONS_REFRESH_INTERVAL,
    staleTime: NOTIFICATIONS_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook for fetching notification statistics
 */
export function useNotificationStats(days = 7) {
  return useQuery({
    queryKey: notificationKeys.stats(days),
    queryFn: () => apiClient.getNotificationStats(days),
    refetchInterval: STATS_REFRESH_INTERVAL,
    staleTime: STATS_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook for fetching notifications grouped by user
 */
export function useNotificationsByUser(skip = 0, limit = 20, search?: string, days = 30) {
  return useQuery({
    queryKey: [...notificationKeys.all, "by-user", skip, limit, search ?? "", days],
    queryFn: () => apiClient.getNotificationsByUser({ skip, limit, search, days }),
    refetchInterval: NOTIFICATIONS_REFRESH_INTERVAL,
    staleTime: NOTIFICATIONS_REFRESH_INTERVAL - 5000,
  });
}

/**
 * Hook for fetching a single notification detail
 */
export function useNotificationDetail(notificationId: string | null) {
  return useQuery({
    queryKey: notificationKeys.detail(notificationId || ""),
    queryFn: () => apiClient.getNotificationById(notificationId!),
    enabled: !!notificationId,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook for resending a notification
 */
export function useResendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient.resendNotification(notificationId),
    onSuccess: (data, notificationId) => {
      // Invalidate the specific notification detail
      queryClient.invalidateQueries({
        queryKey: notificationKeys.detail(notificationId),
      });
      // Invalidate the notification lists to update status
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
        predicate: (query) => query.queryKey.includes("stats"),
      });
    },
  });
}

/**
 * Hook for sending a custom notification
 */
export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendNotificationRequest) => apiClient.sendNotification(request),
    onSuccess: () => {
      // Invalidate all notification queries to show new notifications
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to manually refresh all notification data
 */
export function useRefreshNotifications() {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
    refreshStats: (days = 7) => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.stats(days),
      });
    },
    refreshList: (filters?: NotificationFilters) => {
      if (filters) {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.list(filters),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: notificationKeys.lists(),
        });
      }
    },
  };
}
