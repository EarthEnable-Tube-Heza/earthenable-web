"use client";

/**
 * SalesforceSyncCard Component
 *
 * Displays Salesforce sync status, history, and success rate.
 */

import { Card, Spinner, Badge } from "@/src/components/ui";
import { useSalesforceSyncStatus } from "@/src/hooks/useMonitoring";
import { StatusIndicator } from "./StatusIndicator";

export function SalesforceSyncCard() {
  const { data, isLoading, error } = useSalesforceSyncStatus(5);

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return "-";
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getStatusBadgeVariant = (
    status: string
  ): "success" | "warning" | "error" | "primary" | "secondary" => {
    switch (status) {
      case "completed":
        return "success";
      case "running":
        return "primary";
      case "failed":
        return "error";
      default:
        return "secondary";
    }
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
          <p className="font-medium">Failed to load sync status</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  const successRate = data.success_rate_24h;
  const successRateColor =
    successRate >= 95 ? "text-green-600" : successRate >= 80 ? "text-yellow-600" : "text-red-600";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Salesforce Sync</h3>
        <StatusIndicator
          status={
            data.last_sync_status === "completed"
              ? "healthy"
              : data.last_sync_status === "running"
                ? "degraded"
                : "unhealthy"
          }
          size="lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Last Sync</p>
          <p className="font-medium text-sm">{formatDate(data.last_successful_sync)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Next Sync</p>
          <p className="font-medium text-sm">{formatDate(data.next_scheduled_sync)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className={`text-2xl font-bold ${successRateColor}`}>{successRate.toFixed(0)}%</p>
          <p className="text-xs text-gray-500">Success Rate</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-gray-900">{data.total_syncs_24h}</p>
          <p className="text-xs text-gray-500">Total (24h)</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-red-600">{data.failed_syncs_24h}</p>
          <p className="text-xs text-gray-500">Failed (24h)</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Syncs</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b">
                <th className="text-left py-1 font-medium">Type</th>
                <th className="text-left py-1 font-medium">Status</th>
                <th className="text-right py-1 font-medium">Records</th>
                <th className="text-right py-1 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_syncs.slice(0, 5).map((sync) => (
                <tr key={sync.id} className="border-b border-gray-100">
                  <td className="py-2 capitalize">{sync.sync_type.replace(/_/g, " ")}</td>
                  <td className="py-2">
                    <Badge variant={getStatusBadgeVariant(sync.status)} size="sm">
                      {sync.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">{sync.total_records_synced}</td>
                  <td className="py-2 text-right">{formatDuration(sync.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Interval: every {data.sync_interval_minutes} minutes
      </div>
    </Card>
  );
}
