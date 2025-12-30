"use client";

/**
 * User Notifications Modal
 *
 * Modal for viewing a user's individual notifications.
 * Similar to UserSyncSessionsModal pattern.
 */

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useNotifications } from "@/src/hooks/useNotifications";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import {
  UserNotificationStatsItem,
  getNotificationTypeLabel,
  getNotificationTypeColors,
  getDeliveryStatusColors,
} from "@/src/types/notification";
import { cn } from "@/src/lib/theme";
import { NotificationDetailModal } from "./NotificationDetailModal";

interface UserNotificationsModalProps {
  user: UserNotificationStatsItem | null;
  isOpen: boolean;
  onClose: () => void;
}

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

// Get delivery status from is_sent and is_read
function getDeliveryStatus(isSent: boolean, isRead: boolean): "pending" | "sent" | "read" {
  if (isRead) return "read";
  if (isSent) return "sent";
  return "pending";
}

export function UserNotificationsModal({ user, isOpen, onClose }: UserNotificationsModalProps) {
  const [page, setPage] = useState(0);
  const limit = 20;
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch user's notifications
  const { data, isLoading, error } = useNotifications({
    user_id: user?.user_id || undefined,
    skip: page * limit,
    limit,
  });

  const notifications = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleViewDetail = (notificationId: string) => {
    setSelectedNotificationId(notificationId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedNotificationId(null);
  };

  const handleClose = () => {
    setPage(0);
    onClose();
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
              <div className="flex items-center gap-4">
                {user.user_picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_picture}
                    alt={user.user_name || "User"}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {(user.user_name || user.user_email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                    {user.user_name || "Unknown User"}
                  </Dialog.Title>
                  <p className="text-sm text-text-secondary">{user.user_email}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-text-secondary hover:text-text-primary transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Stats Summary */}
            <div className="px-6 py-3 bg-background-light border-b border-border-light">
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-text-secondary">Total:</span>{" "}
                  <span className="font-medium text-text-primary">{user.total_count}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Sent:</span>{" "}
                  <span className="font-medium text-status-info">{user.sent_count}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Read:</span>{" "}
                  <span className="font-medium text-status-success">{user.read_count}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Pending:</span>{" "}
                  <span className="font-medium text-status-warning">{user.pending_count}</span>
                </div>
                <div>
                  <span className="text-text-secondary">Read Rate:</span>{" "}
                  <span className="font-medium text-text-primary">{user.read_rate}%</span>
                </div>
                {!user.has_push_token && (
                  <Badge variant="warning" size="sm">
                    No Push Token
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-status-error">
                  Failed to load notifications
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No notifications found for this user
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Sent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => {
                      const deliveryStatus = getDeliveryStatus(
                        notification.is_sent,
                        notification.is_read
                      );
                      const typeColors = getNotificationTypeColors(notification.notification_type);
                      const statusColors = getDeliveryStatusColors(deliveryStatus);

                      return (
                        <tr
                          key={notification.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewDetail(notification.id)}
                        >
                          <td className="py-3 px-4">
                            <Badge className={cn(typeColors.bg, typeColors.text)} size="sm">
                              {getNotificationTypeLabel(notification.notification_type)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-[300px]">
                              <div className="font-medium text-gray-900 truncate">
                                {notification.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {notification.body}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={cn(statusColors.bg, statusColors.text)} size="sm">
                              {deliveryStatus.charAt(0).toUpperCase() + deliveryStatus.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              title={
                                notification.sent_at
                                  ? new Date(notification.sent_at).toLocaleString()
                                  : notification.created_at
                                    ? new Date(notification.created_at).toLocaleString()
                                    : undefined
                              }
                              className="text-gray-500"
                            >
                              {formatRelativeTime(notification.sent_at || notification.created_at)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(notification.id);
                              }}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer with Pagination */}
            <div className="px-6 py-4 border-t border-border-light bg-background-light">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notificationId={selectedNotificationId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
      />
    </>
  );
}
