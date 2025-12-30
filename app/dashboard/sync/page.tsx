"use client";

/**
 * Sync Dashboard Page
 *
 * Comprehensive view of sync operations for investigation and monitoring:
 * - Salesforce ↔ API sync history and statistics
 * - App Users ↔ API task sync sessions and states
 */

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, Spinner, Button, LabeledSelect, MultiSelect } from "@/src/components/ui";
import {
  useSalesforceSyncHistory,
  useSalesforceSyncStats,
  useUserSyncSessions,
  useUserSyncStates,
  useUserSyncStats,
} from "@/src/hooks/useSync";
import { formatRoleLabel } from "@/src/types/user";
import { UserSyncStateDetail } from "@/src/types/sync";
import { UserSyncSessionsModal } from "@/src/components/UserSyncSessionsModal";

// Tab types
type TabType = "salesforce" | "user-sessions" | "user-states";

// Date range options
const DATE_RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

// Status badge colors
const STATUS_COLORS: Record<string, "success" | "error" | "warning" | "info" | "default"> = {
  completed: "success",
  failed: "error",
  running: "warning",
  partial: "info",
  true: "success",
  false: "error",
};

// Format relative time
function formatRelativeTime(dateStr: string | null): string {
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
}

// Format duration
function formatDuration(seconds: number | null): string {
  if (seconds === null) return "-";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toFixed(0)}s`;
}

// Stat Card Component
function StatCard({
  label,
  value,
  subValue,
  color = "#1a1a1a",
}: {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
    </div>
  );
}

// Pagination Component
function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// Salesforce Sync Tab Content
function SalesforceSyncTab() {
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data: history, isLoading: historyLoading } = useSalesforceSyncHistory(
    page,
    20,
    statusFilter || undefined,
    typeFilter || undefined,
    days
  );
  const { data: stats, isLoading: statsLoading } = useSalesforceSyncStats(days);

  if (statsLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard label="Total Syncs" value={stats.total_syncs} subValue={`Last ${days} days`} />
          <StatCard
            label="Success Rate"
            value={`${stats.success_rate}%`}
            color={
              stats.success_rate >= 95
                ? "#124D37"
                : stats.success_rate >= 80
                  ? "#D5A34C"
                  : "#E04562"
            }
          />
          <StatCard label="Records Synced" value={stats.total_records_synced} color="#3E57AB" />
          <StatCard label="API Calls" value={stats.total_api_calls} color="#78373B" />
          <StatCard
            label="Avg Duration"
            value={formatDuration(stats.avg_duration_seconds)}
            color="#EA6A00"
          />
          <StatCard label="Failed" value={stats.failed_syncs} color="#E04562" />
        </div>
      )}

      {/* Object-level Stats */}
      {stats && stats.object_stats.length > 0 && (
        <Card padding="md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Records by Object Type</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Object Type</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Fetched</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Saved</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Updated</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Avg Duration</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Sync Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.object_stats.map((obj) => (
                  <tr key={obj.object_type} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{obj.object_type}</td>
                    <td className="py-2 px-3 text-right">{obj.total_fetched.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-green-600">
                      {obj.total_saved.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-blue-600">
                      {obj.total_updated.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {formatDuration(obj.avg_duration_seconds)}
                    </td>
                    <td className="py-2 px-3 text-right">{obj.sync_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card padding="md" className="overflow-visible">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <LabeledSelect
              label="Period"
              value={String(days)}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setPage(1);
              }}
              options={DATE_RANGE_OPTIONS}
              size="sm"
              fullWidth
            />
          </div>
          <div className="w-40">
            <LabeledSelect
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Statuses" },
                { value: "completed", label: "Completed" },
                { value: "failed", label: "Failed" },
                { value: "running", label: "Running" },
                { value: "partial", label: "Partial" },
              ]}
              size="sm"
              fullWidth
            />
          </div>
          <div className="w-44">
            <LabeledSelect
              label="Sync Type"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Types" },
                { value: "scheduled", label: "Scheduled" },
                { value: "manual", label: "Manual" },
                { value: "delayed_ecosystem", label: "Delayed Ecosystem" },
              ]}
              size="sm"
              fullWidth
            />
          </div>
        </div>
      </Card>

      {/* Sync History Table */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync History</h3>
        {history && history.syncs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Started</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Type</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Duration</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Records</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">API Calls</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Triggered By</th>
                  </tr>
                </thead>
                <tbody>
                  {history.syncs.map((sync) => (
                    <tr key={sync.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <span title={new Date(sync.started_at).toLocaleString()}>
                          {formatRelativeTime(sync.started_at)}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" size="sm">
                          {sync.sync_type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={STATUS_COLORS[sync.status] || "default"} size="sm">
                          {sync.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {formatDuration(sync.duration_seconds)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {sync.total_records_saved.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">{sync.total_api_calls}</td>
                      <td className="py-2 px-3 text-gray-500">{sync.triggered_by || "system"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={history.page}
              totalPages={history.total_pages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No sync history found</p>
        )}
      </Card>
    </div>
  );
}

// User Sync Sessions Tab Content
function UserSyncSessionsTab() {
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);
  const [syncTypeFilter, setSyncTypeFilter] = useState<string>("");
  const [successFilter, setSuccessFilter] = useState<string>("");

  const { data: sessions, isLoading: sessionsLoading } = useUserSyncSessions(
    page,
    20,
    undefined,
    syncTypeFilter || undefined,
    successFilter === "" ? undefined : successFilter === "true",
    days
  );
  const { data: stats, isLoading: statsLoading } = useUserSyncStats(days);

  if (statsLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Sessions"
            value={stats.total_sync_sessions}
            subValue={`Last ${days} days`}
          />
          <StatCard
            label="Success Rate"
            value={`${stats.success_rate}%`}
            color={
              stats.success_rate >= 95
                ? "#124D37"
                : stats.success_rate >= 80
                  ? "#D5A34C"
                  : "#E04562"
            }
          />
          <StatCard label="Tasks Synced" value={stats.total_tasks_synced} color="#3E57AB" />
          <StatCard label="Unique Users" value={stats.unique_users} color="#EA6A00" />
          <StatCard label="Avg Tasks/Sync" value={stats.avg_tasks_per_sync} color="#78373B" />
          <StatCard label="Active Installs" value={stats.active_installations} color="#124D37" />
        </div>
      )}

      {/* Distribution Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* By Type */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Syncs by Type</h3>
            <div className="space-y-2">
              {Object.entries(stats.syncs_by_type).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <Badge variant={type === "full" ? "primary" : "secondary"} size="sm">
                    {type}
                  </Badge>
                  <span className="font-medium">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* By Platform */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Syncs by Platform</h3>
            <div className="space-y-2">
              {Object.entries(stats.syncs_by_platform).map(([platform, count]) => (
                <div key={platform} className="flex justify-between items-center">
                  <Badge variant={platform === "android" ? "success" : "info"} size="sm">
                    {platform}
                  </Badge>
                  <span className="font-medium">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card padding="md" className="overflow-visible">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-40">
            <LabeledSelect
              label="Period"
              value={String(days)}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setPage(1);
              }}
              options={DATE_RANGE_OPTIONS}
              size="sm"
              fullWidth
            />
          </div>
          <div className="w-40">
            <LabeledSelect
              label="Sync Type"
              value={syncTypeFilter}
              onChange={(e) => {
                setSyncTypeFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All Types" },
                { value: "full", label: "Full" },
                { value: "incremental", label: "Incremental" },
              ]}
              size="sm"
              fullWidth
            />
          </div>
          <div className="w-40">
            <LabeledSelect
              label="Status"
              value={successFilter}
              onChange={(e) => {
                setSuccessFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "All" },
                { value: "true", label: "Success" },
                { value: "false", label: "Failed" },
              ]}
              size="sm"
              fullWidth
            />
          </div>
        </div>
      </Card>

      {/* Sessions Table */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Sessions</h3>
        {sessions && sessions.sessions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">User</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Time</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Type</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Tasks</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Platform</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">App Version</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.sessions.map((session) => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/users/${session.user_id}`}
                            className="font-medium text-gray-900 hover:text-primary truncate max-w-[150px]"
                          >
                            {session.user_name || "Unknown"}
                          </Link>
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {session.user_email}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span title={new Date(session.started_at).toLocaleString()}>
                          {formatRelativeTime(session.started_at)}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <Badge
                          variant={session.sync_type === "full" ? "primary" : "secondary"}
                          size="sm"
                        >
                          {session.sync_type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={session.success ? "success" : "error"} size="sm">
                          {session.success ? "Success" : "Failed"}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="font-medium">{session.tasks_returned_count}</span>
                        {session.has_more && (
                          <span className="text-gray-400 text-xs ml-1">+more</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {session.client_platform && (
                          <Badge
                            variant={session.client_platform === "android" ? "success" : "info"}
                            size="sm"
                          >
                            {session.client_platform}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {session.client_app_version || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={sessions.page}
              totalPages={sessions.total_pages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No sync sessions found</p>
        )}
      </Card>
    </div>
  );
}

// User Sync States Tab Content
function UserSyncStatesTab() {
  const [page, setPage] = useState(0); // 0-based pagination like users/tasks
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [forceFullSyncFilter, setForceFullSyncFilter] = useState<string>("");
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserSyncStateDetail | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 20;

  // Handle row click to open modal
  const handleRowClick = (state: UserSyncStateDetail) => {
    setSelectedUserForModal(state);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserForModal(null);
  };

  // Fetch states with max page size for client-side filtering (API max is 100)
  const { data: states, isLoading } = useUserSyncStates(
    1, // Always fetch from page 1
    100, // Max allowed by API
    undefined,
    undefined,
    forceFullSyncFilter === "" ? undefined : forceFullSyncFilter === "true"
  );

  // Extract unique roles and users from the data for filter options
  const roleOptions = states?.states
    ? Array.from(new Set(states.states.map((s) => s.user_role).filter(Boolean)))
        .sort()
        .map((role) => ({ value: role!, label: formatRoleLabel(role!) }))
    : [];

  const userOptions = states?.states
    ? Array.from(
        new Map(
          states.states
            .filter((s) => s.user_name || s.user_email)
            .map((s) => [s.user_id, { id: s.user_id, name: s.user_name, email: s.user_email }])
        ).values()
      )
        .sort((a, b) => (a.name || a.email || "").localeCompare(b.name || b.email || ""))
        .map((u) => ({ value: u.id, label: u.name || u.email || u.id }))
    : [];

  // Apply client-side filters
  const filteredStates =
    states?.states.filter((state) => {
      // Role filter
      if (selectedRoles.length > 0 && !selectedRoles.includes(state.user_role || "")) {
        return false;
      }
      // User filter
      if (selectedUsers.length > 0 && !selectedUsers.includes(state.user_id)) {
        return false;
      }
      return true;
    }) || [];

  // Client-side pagination
  const total = filteredStates.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedStates = filteredStates.slice(page * limit, (page + 1) * limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card padding="md" className="overflow-visible">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-56">
            <MultiSelect
              label="Role"
              options={roleOptions}
              value={selectedRoles}
              onChange={(values) => {
                setSelectedRoles(values);
                setPage(0);
              }}
              placeholder="All Roles"
              size="sm"
            />
          </div>
          <div className="w-64">
            <MultiSelect
              label="User"
              options={userOptions}
              value={selectedUsers}
              onChange={(values) => {
                setSelectedUsers(values);
                setPage(0);
              }}
              placeholder="All Users"
              size="sm"
            />
          </div>
          <div className="w-48">
            <LabeledSelect
              label="Force Full Sync"
              value={forceFullSyncFilter}
              onChange={(e) => {
                setForceFullSyncFilter(e.target.value);
                setPage(0);
              }}
              options={[
                { value: "", label: "All States" },
                { value: "true", label: "Needing Full Sync" },
                { value: "false", label: "Normal State" },
              ]}
              size="sm"
              fullWidth
            />
          </div>
        </div>
      </Card>

      {/* States Table */}
      <Card padding="md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Sync States</h3>
        {paginatedStates.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">User</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Role</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Syncs</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">
                      <span title="New tasks synced">New</span>
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">
                      <span title="Updated tasks synced">Updated</span>
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">
                      <span title="Deleted tasks synced">Deleted</span>
                    </th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">
                      <span title="Estimated current tasks (new - deleted)">Current</span>
                    </th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Last Sync</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Force Full</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStates.map((state) => (
                    <tr
                      key={state.id}
                      className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(state)}
                      title="Click to view sync sessions"
                    >
                      <td className="py-2 px-3">
                        <div className="flex flex-col">
                          <Link
                            href={`/dashboard/users/${state.user_id}`}
                            className="font-medium text-gray-900 hover:text-primary truncate max-w-[150px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {state.user_name || "Unknown"}
                          </Link>
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {state.user_email}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        {state.user_role && (
                          <Badge variant="secondary" size="sm">
                            {formatRoleLabel(state.user_role)}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">{state.total_syncs}</td>
                      <td className="py-2 px-3 text-right text-green-600">
                        {state.total_tasks_new?.toLocaleString() ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right text-blue-600">
                        {state.total_tasks_updated?.toLocaleString() ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right text-red-600">
                        {state.total_tasks_deleted?.toLocaleString() ?? "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold">
                        {state.current_task_count?.toLocaleString() ?? "-"}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          title={
                            state.last_sync_timestamp
                              ? new Date(state.last_sync_timestamp).toLocaleString()
                              : undefined
                          }
                        >
                          {formatRelativeTime(state.last_sync_timestamp)}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant={state.force_full_sync ? "warning" : "default"} size="sm">
                          {state.force_full_sync ? "Yes" : "No"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - matching users/tasks tables */}
            {totalPages > 1 && (
              <div className="px-2 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="text-sm text-gray-500">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}{" "}
                  states
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      page === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      page === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-gray-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      page >= totalPages - 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      page >= totalPages - 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">No sync states found</p>
        )}
      </Card>

      {/* User Sync Sessions Modal */}
      <UserSyncSessionsModal
        user={selectedUserForModal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

// Main Page Component
export default function SyncPage() {
  const [activeTab, setActiveTab] = useState<TabType>("salesforce");

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">Sync</li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Sync Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Monitor and investigate synchronization between Salesforce, API, and mobile app users
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("salesforce")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "salesforce"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Salesforce ↔ API
          </button>
          <button
            onClick={() => setActiveTab("user-sessions")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "user-sessions"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            User Sync Sessions
          </button>
          <button
            onClick={() => setActiveTab("user-states")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "user-states"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            User Sync States
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "salesforce" && <SalesforceSyncTab />}
      {activeTab === "user-sessions" && <UserSyncSessionsTab />}
      {activeTab === "user-states" && <UserSyncStatesTab />}
    </div>
  );
}
