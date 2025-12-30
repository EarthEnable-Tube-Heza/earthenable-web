"use client";

/**
 * Notification Detail Modal
 *
 * Modal for viewing complete notification details with delivery timeline
 * and option to resend failed/pending notifications.
 */

import { Dialog } from "@headlessui/react";
import { useNotificationDetail, useResendNotification } from "@/src/hooks/useNotifications";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { Toast, ToastType } from "../ui/Toast";
import {
  getNotificationTypeLabel,
  getNotificationTypeColors,
  getDeliveryStatusLabel,
  getDeliveryStatusColors,
} from "@/src/types/notification";
import { cn } from "@/src/lib/theme";
import { useState } from "react";

interface NotificationDetailModalProps {
  notificationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Info Row Component
 */
function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {icon && <span className="text-text-secondary mt-0.5">{icon}</span>}
      <div className="flex-1">
        <div className="text-xs text-text-secondary">{label}</div>
        <div className="text-sm text-text-primary">{value || "-"}</div>
      </div>
    </div>
  );
}

/**
 * Timeline Item Component
 */
function TimelineItem({
  label,
  timestamp,
  isActive,
  isCompleted,
}: {
  label: string;
  timestamp?: string | null;
  isActive: boolean;
  isCompleted: boolean;
}) {
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-3 h-3 rounded-full border-2",
          isCompleted
            ? "bg-status-success border-status-success"
            : isActive
              ? "bg-status-info border-status-info"
              : "bg-white border-border-light"
        )}
      />
      <div className="flex-1">
        <div
          className={cn(
            "text-sm",
            isCompleted || isActive ? "text-text-primary" : "text-text-secondary"
          )}
        >
          {label}
        </div>
        {timestamp && (
          <div className="text-xs text-text-secondary">{formatDateTime(timestamp)}</div>
        )}
      </div>
    </div>
  );
}

export function NotificationDetailModal({
  notificationId,
  isOpen,
  onClose,
}: NotificationDetailModalProps) {
  const [toast, setToast] = useState<{
    visible: boolean;
    type: ToastType;
    message: string;
  }>({ visible: false, type: "success", message: "" });

  const { data: notification, isLoading, error } = useNotificationDetail(notificationId);
  const resendMutation = useResendNotification();

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleResend = async () => {
    if (!notificationId) return;

    try {
      const result = await resendMutation.mutateAsync(notificationId);
      setToast({
        visible: true,
        type: result.success ? "success" : "error",
        message: result.message,
      });
    } catch (err) {
      setToast({
        visible: true,
        type: "error",
        message: err instanceof Error ? err.message : "Failed to resend notification",
      });
    }
  };

  const canResend =
    notification &&
    (notification.delivery_status === "pending" || notification.delivery_status === "failed");

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-light flex items-start justify-between">
            <div>
              <Dialog.Title className="text-xl font-heading font-bold text-text-primary">
                Notification Details
              </Dialog.Title>
              {notification && (
                <div className="text-sm text-text-secondary mt-0.5">ID: {notification.id}</div>
              )}
            </div>
            <button
              onClick={onClose}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-status-error">Failed to load notification details</p>
              </div>
            ) : notification ? (
              <div className="space-y-6">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    className={cn(
                      getNotificationTypeColors(notification.notification_type).bg,
                      getNotificationTypeColors(notification.notification_type).text
                    )}
                  >
                    {getNotificationTypeLabel(notification.notification_type)}
                  </Badge>
                  <Badge
                    className={cn(
                      getDeliveryStatusColors(notification.delivery_status).bg,
                      getDeliveryStatusColors(notification.delivery_status).text
                    )}
                  >
                    {getDeliveryStatusLabel(notification.delivery_status)}
                  </Badge>
                  {!notification.user_has_push_token && (
                    <Badge variant="warning">No Push Token</Badge>
                  )}
                </div>

                {/* User Info */}
                <div className="bg-background-light rounded-lg p-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Recipient</h3>
                  <div className="flex items-center gap-3">
                    {notification.user_picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={notification.user_picture}
                        alt={notification.user_name || "User"}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {(notification.user_name ||
                            notification.user_email ||
                            "U")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-text-primary">
                        {notification.user_name || "Unknown User"}
                      </div>
                      <div className="text-sm text-text-secondary">{notification.user_email}</div>
                    </div>
                  </div>
                </div>

                {/* Notification Content */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Content</h3>
                  <div className="bg-background-light rounded-lg p-4">
                    <div className="font-medium text-text-primary mb-1">{notification.title}</div>
                    <div className="text-sm text-text-secondary whitespace-pre-wrap">
                      {notification.body}
                    </div>
                  </div>
                </div>

                {/* Task Info (if linked) */}
                {notification.task_id && (
                  <div className="bg-background-light rounded-lg p-4">
                    <h3 className="text-sm font-medium text-text-secondary mb-3">Linked Task</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow label="Task ID" value={notification.task_id} />
                      <InfoRow label="Subject" value={notification.task_subject} />
                      {notification.task_status && (
                        <InfoRow label="Status" value={notification.task_status} />
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Timeline */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">
                    Delivery Timeline
                  </h3>
                  <div className="bg-background-light rounded-lg p-4 space-y-4">
                    <TimelineItem
                      label="Created"
                      timestamp={notification.created_at}
                      isActive={false}
                      isCompleted={true}
                    />
                    <div className="ml-1.5 h-4 w-px bg-border-light" />
                    <TimelineItem
                      label="Sent"
                      timestamp={notification.sent_at}
                      isActive={notification.is_sent && !notification.is_read}
                      isCompleted={notification.is_sent}
                    />
                    <div className="ml-1.5 h-4 w-px bg-border-light" />
                    <TimelineItem
                      label="Read"
                      timestamp={notification.read_at}
                      isActive={false}
                      isCompleted={notification.is_read}
                    />
                  </div>
                </div>

                {/* Technical Details */}
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-2">
                    Technical Details
                  </h3>
                  <div className="bg-background-light rounded-lg p-4 grid grid-cols-2 gap-4">
                    <InfoRow label="Created At" value={formatDateTime(notification.created_at)} />
                    <InfoRow label="Sent At" value={formatDateTime(notification.sent_at)} />
                    <InfoRow label="Read At" value={formatDateTime(notification.read_at)} />
                    <InfoRow label="Receipt ID" value={notification.expo_receipt_id} />
                  </div>
                </div>

                {/* Raw Data (collapsible) */}
                {notification.data && Object.keys(notification.data).length > 0 && (
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary">
                      View Raw Data
                    </summary>
                    <pre className="mt-2 bg-background-light rounded-lg p-4 text-xs text-text-primary overflow-x-auto">
                      {JSON.stringify(notification.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-light bg-background-light">
            <div className="flex justify-between items-center">
              <div>
                {canResend && (
                  <Button
                    variant="primary"
                    onClick={handleResend}
                    loading={resendMutation.isPending}
                    disabled={resendMutation.isPending}
                  >
                    Resend Notification
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </div>

      {/* Toast notifications */}
      <Toast
        visible={toast.visible}
        type={toast.type}
        message={toast.message}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </Dialog>
  );
}
