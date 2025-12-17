"use client";

/**
 * ServerHealthCard Component
 *
 * Displays overall server health status including API, database, Redis, and Salesforce.
 */

import { Card, Spinner } from "@/src/components/ui";
import { useServerHealth } from "@/src/hooks/useMonitoring";
import { StatusIndicator } from "./StatusIndicator";

export function ServerHealthCard() {
  const { data, isLoading, error, dataUpdatedAt } = useServerHealth();

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatLastUpdated = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
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
          <p className="font-medium">Failed to load server health</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Server Health</h3>
        <StatusIndicator status={data.overall_status} size="lg" showLabel />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Version</p>
          <p className="font-medium">{data.api_version}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Uptime</p>
          <p className="font-medium">{formatUptime(data.uptime_seconds)}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Services</h4>
        <div className="space-y-2">
          {data.services.map((service) => (
            <div key={service.name} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <StatusIndicator status={service.status} size="sm" />
                <span className="text-sm capitalize">{service.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {service.latency_ms !== null ? `${service.latency_ms.toFixed(0)}ms` : "-"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t mt-4 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Scheduler</h4>
        <div className="flex items-center gap-2 mb-2">
          <StatusIndicator status={data.scheduler_running ? "healthy" : "unhealthy"} size="sm" />
          <span className="text-sm">{data.scheduler_running ? "Running" : "Stopped"}</span>
        </div>
        {data.scheduler_jobs.length > 0 && (
          <div className="text-xs text-gray-500 space-y-1">
            {data.scheduler_jobs.map((job) => (
              <div key={job.id} className="flex justify-between">
                <span>{job.name}</span>
                <span>
                  Next: {job.next_run_time ? new Date(job.next_run_time).toLocaleTimeString() : "-"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Last updated: {formatLastUpdated(dataUpdatedAt)}
      </div>
    </Card>
  );
}
