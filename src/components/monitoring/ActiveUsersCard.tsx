"use client";

/**
 * ActiveUsersCard Component
 *
 * Displays currently online users and DAU/WAU/MAU metrics.
 */

import { Card, Spinner } from "@/src/components/ui";
import { useUserActivityStats } from "@/src/hooks/useMonitoring";

export function ActiveUsersCard() {
  const { data, isLoading, error, dataUpdatedAt } = useUserActivityStats();

  const formatLastUpdated = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load user activity</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{data.currently_online}</p>
          <p className="text-sm text-gray-500">Online Now</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{data.logins_24h}</p>
          <p className="text-sm text-gray-500">Logins (24h)</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xl font-bold text-gray-900">{data.daily_active_users}</p>
          <p className="text-xs text-gray-500">DAU</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xl font-bold text-gray-900">{data.weekly_active_users}</p>
          <p className="text-xs text-gray-500">WAU</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xl font-bold text-gray-900">{data.monthly_active_users}</p>
          <p className="text-xs text-gray-500">MAU</p>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Last updated: {formatLastUpdated(dataUpdatedAt)}
      </div>
    </Card>
  );
}
