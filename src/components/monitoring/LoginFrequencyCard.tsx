"use client";

/**
 * LoginFrequencyCard Component
 *
 * Displays user login frequency statistics with time period filtering.
 * Shows session counts, average gap between sessions, and last login details.
 */

import { useState } from "react";
import { Card, Spinner, Badge } from "@/src/components/ui";
import { useLoginFrequency } from "@/src/hooks/useMonitoring";

type PeriodOption = {
  value: string | undefined;
  label: string;
  days?: number;
};

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "week", label: "Last 7 days", days: 7 },
  { value: undefined, label: "Last 14 days", days: 14 },
  { value: "month", label: "Last 30 days", days: 30 },
  { value: "all", label: "All time" },
];

export function LoginFrequencyCard() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(PERIOD_OPTIONS[2]); // Default to "Last 7 days"

  const { data, isLoading, error, dataUpdatedAt } = useLoginFrequency(
    selectedPeriod.days || 7,
    selectedPeriod.value,
    100
  );

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatGapHours = (hours: number | null): string => {
    if (hours === null) return "-";
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    const days = hours / 24;
    return `${days.toFixed(1)}d`;
  };

  const formatLastUpdated = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load login frequency data</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Login Frequency</h3>
          <p className="text-sm text-gray-500">
            {data.period_label} &bull; {data.total_users} users &bull; {data.total_sessions}{" "}
            sessions
          </p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-1 flex-wrap">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.label}
              onClick={() => setSelectedPeriod(option)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedPeriod.label === option.label
                  ? "bg-[#EA6A00] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Login Frequency Table */}
      {data.users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-3 font-medium text-gray-700">User</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">Role</th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">
                  <span className="hidden sm:inline">Sessions (Period)</span>
                  <span className="sm:hidden">Period</span>
                </th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">
                  <span className="hidden sm:inline">Total Sessions</span>
                  <span className="sm:hidden">Total</span>
                </th>
                <th className="text-center py-2 px-3 font-medium text-gray-700">
                  <span className="hidden sm:inline">Avg Gap</span>
                  <span className="sm:hidden">Gap</span>
                </th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user, index) => (
                <tr
                  key={user.user_id}
                  className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <td className="py-2 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {user.user_name || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">
                        {user.user_email}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge variant={user.role === "admin" ? "primary" : "secondary"} size="sm">
                      {user.role?.replace(/_/g, " ") || "N/A"}
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="font-semibold text-[#EA6A00]">{user.sessions_in_period}</span>
                  </td>
                  <td className="py-2 px-3 text-center text-gray-600">{user.total_sessions}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`font-medium ${
                        user.avg_gap_hours !== null && user.avg_gap_hours > 48
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatGapHours(user.avg_gap_hours)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-gray-900">{formatDate(user.last_login)}</span>
                      {user.last_app_version && (
                        <span className="text-xs text-gray-500">{user.last_app_version}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No login data available for this period
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Gap &lt; 48h</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Gap &gt; 48h</span>
          </div>
        </div>
        <span>Last updated: {formatLastUpdated(dataUpdatedAt)}</span>
      </div>
    </Card>
  );
}
