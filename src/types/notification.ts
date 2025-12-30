/**
 * Notification Types
 *
 * TypeScript interfaces for admin notification management.
 * Matches backend Pydantic schemas in admin_notifications.py
 */

// ============================================================================
// Notification Type Enum
// ============================================================================

/**
 * Notification types matching backend NotificationType enum
 */
export const NotificationType = {
  NEW_TASK: "new_task",
  TASK_REMINDER: "task_reminder",
  TASK_UPDATE: "task_update",
  TASK_OVERDUE: "task_overdue",
  TASK_COMPLETED: "task_completed",
  TASK_STATUS_CHANGED: "task_status_changed",
  TASK_REMOVED: "task_removed",
  TASK_REASSIGNED: "task_reassigned",
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Notification type labels for display
 */
export const NotificationTypeLabels: Record<NotificationTypeValue, string> = {
  [NotificationType.NEW_TASK]: "New Task",
  [NotificationType.TASK_REMINDER]: "Reminder",
  [NotificationType.TASK_UPDATE]: "Update",
  [NotificationType.TASK_OVERDUE]: "Overdue",
  [NotificationType.TASK_COMPLETED]: "Completed",
  [NotificationType.TASK_STATUS_CHANGED]: "Status Changed",
  [NotificationType.TASK_REMOVED]: "Removed",
  [NotificationType.TASK_REASSIGNED]: "Reassigned",
};

/**
 * Notification type badge colors
 */
export const NotificationTypeColors: Record<NotificationTypeValue, { bg: string; text: string }> = {
  [NotificationType.NEW_TASK]: {
    bg: "bg-brand-primary/10",
    text: "text-brand-primary",
  },
  [NotificationType.TASK_REMINDER]: {
    bg: "bg-status-warning/10",
    text: "text-status-warning",
  },
  [NotificationType.TASK_UPDATE]: {
    bg: "bg-status-info/10",
    text: "text-status-info",
  },
  [NotificationType.TASK_OVERDUE]: {
    bg: "bg-status-error/10",
    text: "text-status-error",
  },
  [NotificationType.TASK_COMPLETED]: {
    bg: "bg-status-success/10",
    text: "text-status-success",
  },
  [NotificationType.TASK_STATUS_CHANGED]: {
    bg: "bg-brand-blue/10",
    text: "text-brand-blue",
  },
  [NotificationType.TASK_REMOVED]: {
    bg: "bg-gray-500/10",
    text: "text-gray-500",
  },
  [NotificationType.TASK_REASSIGNED]: {
    bg: "bg-brand-accent/10",
    text: "text-brand-accent",
  },
};

// ============================================================================
// Notification List Types
// ============================================================================

/**
 * Notification list item for paginated responses
 */
export interface AdminNotificationListItem {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  task_id: string | null;
  task_subject: string | null;
  notification_type: NotificationTypeValue;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_sent: boolean;
  sent_at: string | null;
  is_read: boolean;
  read_at: string | null;
  expo_receipt_id: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Paginated notifications response
 */
export interface PaginatedNotificationsResponse {
  items: AdminNotificationListItem[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// ============================================================================
// Notification Detail Types
// ============================================================================

/**
 * Detailed notification response with user and task info
 */
export interface NotificationDetailResponse {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_picture: string | null;
  task_id: string | null;
  task_subject: string | null;
  task_status: string | null;
  notification_type: NotificationTypeValue;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_sent: boolean;
  sent_at: string | null;
  is_read: boolean;
  read_at: string | null;
  expo_receipt_id: string | null;
  created_at: string;
  updated_at: string | null;
  delivery_status: "pending" | "sent" | "read" | "failed";
  user_has_push_token: boolean;
}

// ============================================================================
// Notification Statistics Types
// ============================================================================

/**
 * Breakdown of notifications by type
 */
export interface NotificationTypeBreakdown {
  new_task: number;
  task_reminder: number;
  task_update: number;
  task_overdue: number;
  task_completed: number;
  task_status_changed: number;
  task_removed: number;
  task_reassigned: number;
}

/**
 * Breakdown of push tokens by platform
 */
export interface PlatformBreakdown {
  ios: number;
  android: number;
}

/**
 * Notification statistics response
 */
export interface NotificationStatsResponse {
  // Counts
  total_notifications: number;
  pending_count: number;
  sent_count: number;
  read_count: number;
  sent_today: number;
  read_today: number;

  // Breakdown by type
  by_type: NotificationTypeBreakdown;

  // Delivery metrics
  delivery_success_rate: number;
  average_read_rate: number;

  // Push tokens
  active_push_tokens: number;
  tokens_by_platform: PlatformBreakdown;
}

// ============================================================================
// Notification Action Types
// ============================================================================

/**
 * Response for resend notification operation
 */
export interface ResendNotificationResponse {
  success: boolean;
  message: string;
  notification_id: string;
  new_receipt_id: string | null;
}

/**
 * Request to send a custom notification
 */
export interface SendNotificationRequest {
  user_ids: string[];
  notification_type?: NotificationTypeValue;
  title: string;
  body: string;
  task_id?: string;
  data?: Record<string, unknown>;
  send_immediately?: boolean;
}

/**
 * Response for send notification operation
 */
export interface SendNotificationResponse {
  success: boolean;
  message: string;
  notifications_created: number;
  notifications_sent: number;
  failed_user_ids: string[];
}

// ============================================================================
// User Notification Stats Types
// ============================================================================

/**
 * Notification statistics for a single user
 */
export interface UserNotificationStatsItem {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_picture: string | null;
  user_role: string | null;
  total_count: number;
  sent_count: number;
  read_count: number;
  pending_count: number;
  recent_sent_count: number;
  last_notification_at: string | null;
  delivery_rate: number;
  read_rate: number;
  has_push_token: boolean;
}

/**
 * Paginated user notification stats response
 */
export interface PaginatedUserNotificationStatsResponse {
  items: UserNotificationStatsItem[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
  period_days: number;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Notification status filter options
 */
export type NotificationStatusFilter = "all" | "pending" | "sent" | "read";

/**
 * Notification filters for list queries
 */
export interface NotificationFilters {
  user_id?: string;
  notification_types?: NotificationTypeValue[];
  status?: NotificationStatusFilter;
  date_from?: string;
  date_to?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get label for notification type
 */
export function getNotificationTypeLabel(type: NotificationTypeValue): string {
  return NotificationTypeLabels[type] || type;
}

/**
 * Get badge colors for notification type
 */
export function getNotificationTypeColors(type: NotificationTypeValue): {
  bg: string;
  text: string;
} {
  return NotificationTypeColors[type] || { bg: "bg-gray-100", text: "text-gray-600" };
}

/**
 * Get delivery status label
 */
export function getDeliveryStatusLabel(status: "pending" | "sent" | "read" | "failed"): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    sent: "Sent",
    read: "Read",
    failed: "Failed",
  };
  return labels[status] || status;
}

/**
 * Get delivery status colors
 */
export function getDeliveryStatusColors(status: "pending" | "sent" | "read" | "failed"): {
  bg: string;
  text: string;
} {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-status-warning/10", text: "text-status-warning" },
    sent: { bg: "bg-status-info/10", text: "text-status-info" },
    read: { bg: "bg-status-success/10", text: "text-status-success" },
    failed: { bg: "bg-status-error/10", text: "text-status-error" },
  };
  return colors[status] || { bg: "bg-gray-100", text: "text-gray-600" };
}
