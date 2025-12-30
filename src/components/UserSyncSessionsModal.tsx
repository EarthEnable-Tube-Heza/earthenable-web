"use client";

/**
 * User Sync Sessions Modal
 *
 * Modal for viewing individual sync sessions for a user.
 * Shows detailed progression of sync requests with visual charts.
 */

import { useState, useMemo } from "react";
import { Dialog } from "@headlessui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useUserSyncSessions } from "../hooks/useSync";
import { Badge, Spinner } from "./ui";
import { UserSyncStateDetail, UserSyncSessionDetail } from "../types/sync";

interface UserSyncSessionsModalProps {
  user: UserSyncStateDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Format a date string to a readable format
 */
function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}

/**
 * Format duration in seconds to readable format
 */
function formatDuration(startedAt: string | null, completedAt: string | null): string {
  if (!startedAt || !completedAt) return "-";
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const durationMs = end - start;
  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`;
  return `${(durationMs / 60000).toFixed(1)}m`;
}

/**
 * Format date for chart X-axis
 */
function formatChartDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * Prepare chart data from sessions
 * Sessions are sorted chronologically (oldest first) to show progression
 */
function prepareChartData(sessions: UserSyncSessionDetail[]) {
  // Sort by date ascending (oldest first)
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  let cumulativeNew = 0;
  let cumulativeDeleted = 0;

  return sorted.map((session, index) => {
    const newTasks = session.tasks_new_count || 0;
    const updatedTasks = session.tasks_updated_count || 0;
    const deletedTasks = session.tasks_deleted_count || 0;

    // Cumulative tracking for estimated device state
    cumulativeNew += newTasks;
    cumulativeDeleted += deletedTasks;
    const estimatedTasks = cumulativeNew - cumulativeDeleted;

    return {
      index: index + 1,
      date: formatChartDate(session.started_at),
      fullDate: new Date(session.started_at).toLocaleString(),
      syncType: session.sync_type,
      // Per-sync counts
      new: newTasks,
      updated: updatedTasks,
      deleted: deletedTasks,
      returned: session.tasks_returned_count,
      // Cumulative for device state estimation
      cumulativeNew,
      cumulativeDeleted,
      estimatedTasks: Math.max(0, estimatedTasks),
    };
  });
}

/**
 * Custom tooltip for the chart
 */
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: {
    fullDate: string;
    syncType: string;
    new: number;
    updated: number;
    deleted: number;
    returned: number;
    estimatedTasks: number;
  };
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-sm">
      <p className="font-medium text-gray-900 mb-2">
        Sync #{label} - {data?.fullDate}
      </p>
      <p className="text-xs text-gray-500 mb-2">
        Type: <span className="font-medium">{data?.syncType}</span>
      </p>
      <div className="space-y-1">
        <p className="text-green-600">New: {data?.new}</p>
        <p className="text-blue-600">Updated: {data?.updated}</p>
        <p className="text-red-600">Deleted: {data?.deleted}</p>
        <p className="text-gray-600">Returned: {data?.returned}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-purple-600 font-medium">Est. Device Tasks: {data?.estimatedTasks}</p>
      </div>
    </div>
  );
}

export function UserSyncSessionsModal({ user, isOpen, onClose }: UserSyncSessionsModalProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch sync sessions for the selected user (paginated for table)
  const { data: sessions, isLoading } = useUserSyncSessions(
    page,
    pageSize,
    user?.user_id,
    undefined, // syncType
    undefined, // success
    30 // last 30 days
  );

  // Fetch all sessions for chart (max 100 for performance)
  const { data: allSessions, isLoading: isLoadingAll } = useUserSyncSessions(
    1,
    100, // Get more data for the chart
    user?.user_id,
    undefined,
    undefined,
    90 // Last 90 days for better trend visibility
  );

  const totalPages = sessions?.total_pages || 1;

  // Prepare chart data from all sessions
  const chartData = useMemo(() => {
    if (!allSessions?.sessions?.length) return [];
    return prepareChartData(allSessions.sessions);
  }, [allSessions]);

  // Calculate summary stats from chart data
  const summaryStats = useMemo(() => {
    if (!chartData.length) return null;

    const lastPoint = chartData[chartData.length - 1];
    const totalNew = chartData.reduce((sum, d) => sum + d.new, 0);
    const totalUpdated = chartData.reduce((sum, d) => sum + d.updated, 0);
    const totalDeleted = chartData.reduce((sum, d) => sum + d.deleted, 0);
    const fullSyncs = allSessions?.sessions.filter((s) => s.sync_type === "full").length || 0;
    const incrementalSyncs =
      allSessions?.sessions.filter((s) => s.sync_type === "incremental").length || 0;

    return {
      totalSyncs: chartData.length,
      fullSyncs,
      incrementalSyncs,
      totalNew,
      totalUpdated,
      totalDeleted,
      estimatedDeviceTasks: lastPoint?.estimatedTasks || 0,
      lastSyncDate: lastPoint?.fullDate || "-",
    };
  }, [chartData, allSessions]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-large w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                Sync Sessions
              </Dialog.Title>
              {user && (
                <p className="text-sm text-gray-500 mt-1">
                  {user.user_name || user.user_email || user.user_id}
                  {user.user_role && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {user.user_role}
                    </Badge>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Chart Section */}
          {!isLoadingAll && chartData.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              {/* Stats Cards */}
              {summaryStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Syncs</p>
                    <p className="text-xl font-bold text-gray-900">{summaryStats.totalSyncs}</p>
                    <p className="text-xs text-gray-400">
                      {summaryStats.fullSyncs} full / {summaryStats.incrementalSyncs} incr
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">New Tasks</p>
                    <p className="text-xl font-bold text-green-600">
                      {summaryStats.totalNew.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Added to device</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Updated</p>
                    <p className="text-xl font-bold text-blue-600">
                      {summaryStats.totalUpdated.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Modified on device</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Deleted</p>
                    <p className="text-xl font-bold text-red-600">
                      {summaryStats.totalDeleted.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">Removed from device</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200 bg-purple-50">
                    <p className="text-xs text-purple-600 uppercase tracking-wide">
                      Est. Device Tasks
                    </p>
                    <p className="text-xl font-bold text-purple-700">
                      {summaryStats.estimatedDeviceTasks.toLocaleString()}
                    </p>
                    <p className="text-xs text-purple-400">New - Deleted</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Last Sync</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {summaryStats.lastSyncDate}
                    </p>
                  </div>
                </div>
              )}

              {/* Line Chart */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Sync Progression (Last 90 Days)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="index"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                        label={{
                          value: "Sync #",
                          position: "insideBottomRight",
                          offset: -5,
                          fontSize: 11,
                        }}
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine y={0} stroke="#d1d5db" />

                      {/* Per-sync task counts */}
                      <Line
                        type="monotone"
                        dataKey="new"
                        name="New Tasks"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="updated"
                        name="Updated"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="deleted"
                        name="Deleted"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="estimatedTasks"
                        name="Est. Device Tasks"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">Note:</span> New/Updated tasks are often bundled
                  together in sync responses. Deleted tasks include reassigned tasks. The dashed
                  purple line shows estimated cumulative tasks on device.
                </p>
              </div>
            </div>
          )}

          {/* Loading state for chart */}
          {isLoadingAll && (
            <div className="px-6 py-8 border-b border-gray-200 bg-gray-50 flex items-center justify-center">
              <Spinner size="md" />
              <span className="ml-2 text-gray-500">Loading chart data...</span>
            </div>
          )}

          {/* Content - Sessions Table */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Session Details</h4>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner size="lg" />
              </div>
            ) : sessions && sessions.sessions.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Time</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Type</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Returned</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">New</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Updated</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Deleted</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Duration</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Client</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.sessions.map((session) => (
                    <tr
                      key={session.id}
                      className={`border-b hover:bg-gray-50 ${!session.success ? "bg-red-50" : ""}`}
                    >
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <span className="text-gray-900">
                            {formatDateTime(session.started_at)}
                          </span>
                          {session.since_timestamp_used && (
                            <span className="text-xs text-gray-500" title="Since timestamp used">
                              Since: {new Date(session.since_timestamp_used).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant={session.sync_type === "full" ? "warning" : "info"}
                          size="sm"
                        >
                          {session.sync_type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={session.success ? "success" : "error"} size="sm">
                          {session.success ? "Success" : "Failed"}
                        </Badge>
                        {session.error_message && (
                          <p
                            className="text-xs text-red-600 mt-1 truncate max-w-[150px]"
                            title={session.error_message}
                          >
                            {session.error_message}
                          </p>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {session.tasks_returned_count}
                        {session.has_more && (
                          <span className="text-xs text-gray-500 ml-1" title="Has more tasks">
                            +
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-green-600">
                        {session.tasks_new_count ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-600">
                        {session.tasks_updated_count ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right text-red-600">
                        {session.tasks_deleted_count ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {formatDuration(session.started_at, session.completed_at)}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex flex-col text-xs text-gray-500">
                          {session.client_app_version && <span>v{session.client_app_version}</span>}
                          {session.client_platform && <span>{session.client_platform}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No sync sessions found for this user in the last 30 days.
              </div>
            )}
          </div>

          {/* Footer with Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {sessions && sessions.total_count > 0 && (
                <>
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, sessions.total_count)} of {sessions.total_count}{" "}
                  sessions
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                First
              </button>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Prev
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  page >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className={`px-3 py-1.5 rounded text-sm font-medium ${
                  page >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Last
              </button>
              <button
                onClick={onClose}
                className="ml-4 px-4 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
