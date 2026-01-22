"use client";

/**
 * Callbacks List Component
 *
 * Displays a list of scheduled callbacks with status and actions.
 */

import { cn } from "@/src/lib/theme";
import {
  CallCallback,
  CallbackStatus,
  CallbackPriority,
  CALLBACK_PRIORITY_CONFIG,
} from "@/src/types/voice";
import { Badge, Spinner, Button } from "@/src/components/ui";

interface CallbacksListProps {
  /** Callbacks data */
  callbacks: CallCallback[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Total count for pagination */
  totalCount?: number;
  /** Current page */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when dial button is clicked */
  onDial?: (callback: CallCallback) => void;
  /** Callback when edit button is clicked */
  onEdit?: (callback: CallCallback) => void;
  /** Callback when complete button is clicked */
  onComplete?: (callback: CallCallback) => void;
  /** Callback when cancel button is clicked */
  onCancel?: (callback: CallCallback) => void;
  /** Additional class name */
  className?: string;
}

export function CallbacksList({
  callbacks,
  isLoading = false,
  totalCount = 0,
  currentPage,
  pageSize,
  onPageChange,
  onDial,
  onEdit,
  onComplete,
  onCancel,
  className,
}: CallbacksListProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Format scheduled time
  const formatScheduledTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 0) {
      const overdueMins = Math.abs(diffMins);
      if (overdueMins < 60) {
        return { text: `${overdueMins}m overdue`, isOverdue: true };
      }
      const overdueHours = Math.floor(overdueMins / 60);
      return { text: `${overdueHours}h overdue`, isOverdue: true };
    }

    if (diffMins < 60) {
      return { text: `In ${diffMins}m`, isOverdue: false };
    }
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return { text: `In ${hours}h`, isOverdue: false };
    }

    return { text: date.toLocaleDateString(), isOverdue: false };
  };

  // Get status badge variant
  const getStatusVariant = (status: CallbackStatus) => {
    switch (status) {
      case CallbackStatus.PENDING:
        return "warning";
      case CallbackStatus.IN_PROGRESS:
        return "info";
      case CallbackStatus.COMPLETED:
        return "success";
      case CallbackStatus.FAILED:
      case CallbackStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading callbacks..." />
      </div>
    );
  }

  if (callbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-text-disabled mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-text-secondary">No callbacks scheduled</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Callbacks List */}
      <div className="divide-y divide-border-light">
        {callbacks.map((callback) => {
          const priorityConfig = CALLBACK_PRIORITY_CONFIG[callback.priority];
          const scheduled = formatScheduledTime(callback.scheduled_at);
          const isPending = callback.status === CallbackStatus.PENDING;

          return (
            <div
              key={callback.id}
              className={cn(
                "p-4 hover:bg-background-light transition-colors",
                scheduled.isOverdue && isPending && "bg-status-error/5"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-text-primary truncate">
                      {callback.contact_name || callback.phone_number}
                    </span>
                    <Badge
                      variant={
                        callback.priority === CallbackPriority.URGENT
                          ? "error"
                          : callback.priority === CallbackPriority.HIGH
                            ? "warning"
                            : "default"
                      }
                      size="sm"
                    >
                      {priorityConfig?.label || callback.priority}
                    </Badge>
                    <Badge variant={getStatusVariant(callback.status)} size="sm" outline>
                      {callback.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {callback.contact_name && (
                    <p className="text-sm text-text-secondary">{callback.phone_number}</p>
                  )}

                  {callback.notes && (
                    <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                      {callback.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-text-disabled">
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        scheduled.isOverdue && isPending && "text-status-error"
                      )}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {scheduled.text}
                    </span>
                    {callback.assigned_agent_name && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        {callback.assigned_agent_name}
                      </span>
                    )}
                    {callback.queue_name && (
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {callback.queue_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isPending && onDial && (
                    <button
                      onClick={() => onDial(callback)}
                      className="p-2 rounded-lg bg-status-success/10 text-status-success hover:bg-status-success/20 transition-colors"
                      title="Call now"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </button>
                  )}
                  {isPending && onComplete && (
                    <button
                      onClick={() => onComplete(callback)}
                      className="p-2 rounded-lg bg-background-light text-text-secondary hover:bg-border-light transition-colors"
                      title="Mark as complete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  )}
                  {isPending && onEdit && (
                    <button
                      onClick={() => onEdit(callback)}
                      className="p-2 rounded-lg bg-background-light text-text-secondary hover:bg-border-light transition-colors"
                      title="Edit callback"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  {isPending && onCancel && (
                    <button
                      onClick={() => onCancel(callback)}
                      className="p-2 rounded-lg bg-background-light text-text-secondary hover:bg-status-error/10 hover:text-status-error transition-colors"
                      title="Cancel callback"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
          <div className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} callbacks
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-text-primary">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
