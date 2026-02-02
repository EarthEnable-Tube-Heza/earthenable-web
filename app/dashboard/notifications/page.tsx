"use client";

/**
 * Notifications Management Page
 *
 * Admin page for viewing and managing push notifications:
 * - User-centric view with aggregated stats per user
 * - Click user row to see their individual notifications
 * - View overall statistics
 * - Send custom notifications
 */

import { useState } from "react";
import Link from "next/link";
import { Card, Badge, Spinner, Button, Input, LabeledSelect } from "@/src/components/ui";
import { useSetPageHeader } from "@/src/contexts/PageHeaderContext";
import { PageTitle } from "@/src/components/dashboard/PageTitle";
import { PAGE_SPACING } from "@/src/lib/theme";
import { useNotificationsByUser, useNotificationStats } from "@/src/hooks/useNotifications";
import {
  SendNotificationModal,
  NotificationStatsCard,
  UserNotificationsModal,
} from "@/src/components/notifications";
import { UserNotificationStatsItem } from "@/src/types/notification";

// Date range options
const DATE_RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

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

export default function NotificationsPage() {
  // Filter state
  const [search, setSearch] = useState("");
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Modal state
  const [selectedUser, setSelectedUser] = useState<UserNotificationStatsItem | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Fetch users with notification stats
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useNotificationsByUser(page * limit, limit, search || undefined, days);

  // Fetch stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useNotificationStats(7);

  const users = usersData?.items || [];
  const total = usersData?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleRowClick = (user: UserNotificationStatsItem) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  useSetPageHeader({
    title: "Notifications",
    pathLabels: { notifications: "Notifications" },
  });

  return (
    <div className={`container mx-auto max-w-7xl ${PAGE_SPACING}`}>
      {/* Page Title + CTA */}
      <PageTitle
        title="Notifications"
        description="View and manage push notifications sent to mobile app users"
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsSendModalOpen(true)}>
            Send Notification
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="mb-6">
        <NotificationStatsCard stats={stats} isLoading={statsLoading} error={statsError} />
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4 overflow-visible">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-text-primary mb-1">Search</label>
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              size="sm"
            />
          </div>

          {/* Period Filter */}
          <div className="w-40">
            <LabeledSelect
              label="Period"
              value={String(days)}
              onChange={(e) => {
                setDays(Number(e.target.value));
                setPage(0);
              }}
              options={DATE_RANGE_OPTIONS}
              size="sm"
              fullWidth
            />
          </div>

          {/* Reset Filters */}
          {(search || days !== 30) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setDays(30);
                setPage(0);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {usersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : usersError ? (
          <div className="text-center py-12 text-status-error">Failed to load notifications</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No users with notifications found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Sent</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Read</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Pending</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Read Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Last Notification
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Push Token</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(user)}
                      title="Click to view notifications"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {user.user_picture ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.user_picture}
                              alt={user.user_name || "User"}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {(user.user_name || user.user_email || "U")[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <Link
                              href={`/dashboard/users/${user.user_id}`}
                              className="font-medium text-gray-900 hover:text-primary truncate max-w-[150px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {user.user_name || "Unknown"}
                            </Link>
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                              {user.user_email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{user.total_count}</td>
                      <td className="py-3 px-4 text-right text-status-info">{user.sent_count}</td>
                      <td className="py-3 px-4 text-right text-status-success">
                        {user.read_count}
                      </td>
                      <td className="py-3 px-4 text-right text-status-warning">
                        {user.pending_count}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={
                            user.read_rate >= 80
                              ? "text-status-success font-medium"
                              : user.read_rate >= 50
                                ? "text-status-warning font-medium"
                                : "text-status-error font-medium"
                          }
                        >
                          {user.read_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          title={
                            user.last_notification_at
                              ? new Date(user.last_notification_at).toLocaleString()
                              : undefined
                          }
                          className="text-gray-500"
                        >
                          {formatRelativeTime(user.last_notification_at)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.has_push_token ? "success" : "warning"} size="sm">
                          {user.has_push_token ? "Active" : "None"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}{" "}
                  users
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
        )}
      </Card>

      {/* User Notifications Modal */}
      <UserNotificationsModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
      />

      {/* Send Modal */}
      <SendNotificationModal isOpen={isSendModalOpen} onClose={() => setIsSendModalOpen(false)} />
    </div>
  );
}
