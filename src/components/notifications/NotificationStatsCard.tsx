"use client";

/**
 * Notification Stats Card
 *
 * Card component displaying notification statistics.
 */

import { NotificationStatsResponse } from "@/src/types/notification";
import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { cn } from "@/src/lib/theme";

interface NotificationStatsCardProps {
  stats: NotificationStatsResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  className?: string;
}

/**
 * Stat Item Component
 */
function StatItem({
  label,
  value,
  subValue,
  icon,
  variant = "default",
}: {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
}) {
  const variantClasses = {
    default: "bg-background-light",
    success: "bg-status-success/10",
    warning: "bg-status-warning/10",
    info: "bg-status-info/10",
  };

  const iconClasses = {
    default: "text-text-secondary",
    success: "text-status-success",
    warning: "text-status-warning",
    info: "text-status-info",
  };

  return (
    <div className={cn("rounded-lg p-4", variantClasses[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-text-secondary">{label}</div>
          <div className="text-2xl font-bold text-text-primary mt-1">{value}</div>
          {subValue && <div className="text-xs text-text-secondary mt-0.5">{subValue}</div>}
        </div>
        {icon && <div className={cn("p-2 rounded-lg", iconClasses[variant])}>{icon}</div>}
      </div>
    </div>
  );
}

export function NotificationStatsCard({
  stats,
  isLoading,
  error,
  className,
}: NotificationStatsCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center py-8 text-status-error">Failed to load statistics</div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const deliveryRate = stats.delivery_success_rate.toFixed(1);
  const readRate = stats.average_read_rate.toFixed(1);

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {/* Total Notifications */}
      <StatItem
        label="Total Notifications"
        value={stats.total_notifications.toLocaleString()}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        }
      />

      {/* Pending */}
      <StatItem
        label="Pending"
        value={stats.pending_count.toLocaleString()}
        subValue="Awaiting delivery"
        variant="warning"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      {/* Sent Today */}
      <StatItem
        label="Sent Today"
        value={stats.sent_today.toLocaleString()}
        subValue={`${stats.read_today} read`}
        variant="info"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        }
      />

      {/* Delivery Rate */}
      <StatItem
        label="Delivery Rate"
        value={`${deliveryRate}%`}
        subValue={`${readRate}% read`}
        variant="success"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />
    </div>
  );
}

/**
 * Extended Stats Card with breakdown
 */
export function NotificationStatsExtended({ stats, isLoading, error }: NotificationStatsCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-heading font-bold text-text-primary mb-4">
        Notification Breakdown
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* By Type */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">By Type</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">New Task</span>
              <span className="text-text-primary">{stats.by_type.new_task}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Reminder</span>
              <span className="text-text-primary">{stats.by_type.task_reminder}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Update</span>
              <span className="text-text-primary">{stats.by_type.task_update}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Overdue</span>
              <span className="text-text-primary">{stats.by_type.task_overdue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Completed</span>
              <span className="text-text-primary">{stats.by_type.task_completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Status Changed</span>
              <span className="text-text-primary">{stats.by_type.task_status_changed}</span>
            </div>
          </div>
        </div>

        {/* Counts */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Pending</span>
              <span className="text-text-primary">{stats.pending_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Sent</span>
              <span className="text-text-primary">{stats.sent_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Read</span>
              <span className="text-text-primary">{stats.read_count}</span>
            </div>
          </div>
        </div>

        {/* Push Tokens */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Push Tokens</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Active</span>
              <span className="text-text-primary">{stats.active_push_tokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">iOS</span>
              <span className="text-text-primary">{stats.tokens_by_platform.ios}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Android</span>
              <span className="text-text-primary">{stats.tokens_by_platform.android}</span>
            </div>
          </div>
        </div>

        {/* Rates */}
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-2">Rates</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Delivery</span>
              <span className="text-text-primary">{stats.delivery_success_rate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Read</span>
              <span className="text-text-primary">{stats.average_read_rate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
