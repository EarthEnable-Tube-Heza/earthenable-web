"use client";

/**
 * OrphanedTaskCleanupCard Component
 *
 * Displays orphaned task cleanup job status, configuration,
 * manual trigger button, and recent run history.
 */

import { useState } from "react";
import { Card, Spinner, Badge, Button } from "@/src/components/ui";
import {
  useOrphanedTaskCleanupStatus,
  useOrphanedTaskCleanupHistory,
  useTriggerOrphanedTaskCleanup,
  useUpdateOrphanedTaskCleanupConfig,
} from "@/src/hooks/useMonitoring";
import { StatusIndicator } from "./StatusIndicator";

export function OrphanedTaskCleanupCard() {
  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
  } = useOrphanedTaskCleanupStatus();
  const { data: history } = useOrphanedTaskCleanupHistory(5);
  const triggerMutation = useTriggerOrphanedTaskCleanup();
  const updateConfigMutation = useUpdateOrphanedTaskCleanupConfig();

  const [intervalInput, setIntervalInput] = useState<string>("");
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return "-";
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadgeVariant = (
    runStatus: string
  ): "success" | "warning" | "error" | "primary" | "secondary" => {
    switch (runStatus) {
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

  const getHealthStatus = () => {
    if (!status?.last_run) return "degraded";
    if (status.last_run.status === "completed") return "healthy";
    if (status.last_run.status === "failed") return "unhealthy";
    return "degraded";
  };

  const handleTrigger = async () => {
    setTriggerMessage(null);
    try {
      const result = await triggerMutation.mutateAsync();
      setTriggerMessage(result.message);
    } catch {
      setTriggerMessage("Failed to trigger cleanup");
    }
  };

  const handleSaveInterval = async () => {
    const hours = parseInt(intervalInput, 10);
    if (isNaN(hours) || hours < 1 || hours > 168) return;
    await updateConfigMutation.mutateAsync({ interval_hours: hours });
    setIntervalInput("");
  };

  const handleToggleEnabled = async () => {
    if (!status) return;
    await updateConfigMutation.mutateAsync({ is_enabled: !status.is_enabled });
  };

  if (statusLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (statusError || !status) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load cleanup job status</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Orphaned Task Cleanup</h3>
        <StatusIndicator
          status={getHealthStatus() as "healthy" | "degraded" | "unhealthy"}
          size="lg"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-gray-900">
            {status.last_run?.tasks_checked ?? "-"}
          </p>
          <p className="text-xs text-gray-500">Tasks Checked</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-yellow-600">
            {status.last_run?.orphaned_found ?? "-"}
          </p>
          <p className="text-xs text-gray-500">Orphaned Found</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-2xl font-bold text-red-600">
            {status.last_run?.orphaned_deleted ?? "-"}
          </p>
          <p className="text-xs text-gray-500">Deleted</p>
        </div>
      </div>

      {/* Config + Last Run */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Last Run</p>
          <p className="font-medium text-sm">{formatDate(status.last_run_at)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Next Run</p>
          <p className="font-medium text-sm">{formatDate(status.next_run_at)}</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="border-t pt-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Configuration</h4>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-gray-500 whitespace-nowrap">Interval (hours):</label>
            <input
              type="number"
              min={1}
              max={168}
              placeholder={String(status.interval_hours)}
              value={intervalInput}
              onChange={(e) => setIntervalInput(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveInterval}
              disabled={
                !intervalInput ||
                updateConfigMutation.isPending ||
                parseInt(intervalInput, 10) === status.interval_hours
              }
            >
              {updateConfigMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
          <Button
            variant={status.is_enabled ? "outline" : "primary"}
            size="sm"
            onClick={handleToggleEnabled}
            disabled={updateConfigMutation.isPending}
          >
            {status.is_enabled ? "Disable" : "Enable"}
          </Button>
        </div>

        {/* Manual Trigger */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleTrigger}
            disabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" /> Running...
              </span>
            ) : (
              "Run Now"
            )}
          </Button>
          {triggerMessage && <p className="text-xs text-gray-600 flex-1">{triggerMessage}</p>}
        </div>
      </div>

      {/* Recent Runs History */}
      {history && history.runs.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Runs</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b">
                  <th className="text-left py-1 font-medium">Status</th>
                  <th className="text-left py-1 font-medium">Triggered By</th>
                  <th className="text-right py-1 font-medium">Checked</th>
                  <th className="text-right py-1 font-medium">Orphaned</th>
                  <th className="text-right py-1 font-medium">Deleted</th>
                  <th className="text-right py-1 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.runs.map((run) => (
                  <tr key={run.id} className="border-b border-gray-100">
                    <td className="py-2">
                      <Badge variant={getStatusBadgeVariant(run.status)} size="sm">
                        {run.status}
                      </Badge>
                    </td>
                    <td className="py-2 truncate max-w-[100px]">{run.triggered_by || "-"}</td>
                    <td className="py-2 text-right">{run.tasks_checked}</td>
                    <td className="py-2 text-right">{run.orphaned_found}</td>
                    <td className="py-2 text-right">{run.orphaned_deleted}</td>
                    <td className="py-2 text-right">{formatDuration(run.duration_seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-2 border-t text-xs text-gray-400 text-right">
        Interval: every {status.interval_hours} hours | {status.is_enabled ? "Enabled" : "Disabled"}
      </div>
    </Card>
  );
}
