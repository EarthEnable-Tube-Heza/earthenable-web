"use client";

/**
 * Callbacks List Component
 *
 * Paginated table displaying scheduled callbacks with status and actions.
 * Follows the same pattern as the Tasks page table.
 */

import { cn } from "@/src/lib/theme";
import {
  CallCallback,
  CallbackStatus,
  CallbackPriority,
  CALLBACK_PRIORITY_CONFIG,
} from "@/src/types/voice";
import { Badge, Button } from "@/src/components/ui";

interface CallbacksListProps {
  /** Callbacks data */
  callbacks: CallCallback[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error if any */
  error?: Error | null;
  /** Total count for pagination */
  totalCount?: number;
  /** Current page (0-indexed) */
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
  /** Callback to retry on error */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

export function CallbacksList({
  callbacks,
  isLoading = false,
  error = null,
  totalCount = 0,
  currentPage,
  pageSize,
  onPageChange,
  onDial,
  onEdit,
  onComplete,
  onCancel,
  onRetry,
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

    return {
      text: date.toLocaleDateString([], { month: "short", day: "numeric" }),
      isOverdue: false,
    };
  };

  // Format date/time for display
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
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

  // Get priority badge variant
  const getPriorityVariant = (priority: CallbackPriority) => {
    switch (priority) {
      case CallbackPriority.URGENT:
        return "error";
      case CallbackPriority.HIGH:
        return "warning";
      case CallbackPriority.NORMAL:
        return "default";
      case CallbackPriority.LOW:
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-medium overflow-hidden", className)}>
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-text-secondary mt-2">Loading callbacks...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-status-error">Error loading callbacks. Please try again.</p>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4">
              Retry
            </Button>
          )}
        </div>
      ) : callbacks.length === 0 ? (
        <div className="p-8 text-center">
          <svg
            className="w-16 h-16 text-text-disabled mx-auto mb-4"
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
          <p className="text-text-secondary">No callbacks scheduled.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-background-light border-b border-border-light">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Scheduled
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {callbacks.map((callback) => {
                  const priorityConfig = CALLBACK_PRIORITY_CONFIG[callback.priority];
                  const scheduled = formatScheduledTime(callback.scheduled_at);
                  const { date, time } = formatDateTime(callback.scheduled_at);
                  const isPending = callback.status === CallbackStatus.PENDING;

                  return (
                    <tr
                      key={callback.id}
                      className={cn(
                        "hover:bg-background-light transition-colors",
                        scheduled.isOverdue && isPending && "bg-status-error/5"
                      )}
                    >
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text-primary">
                            {callback.contact_name || "-"}
                          </span>
                          {callback.notes && (
                            <span className="text-xs text-text-secondary line-clamp-1 max-w-[200px]">
                              {callback.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-text-primary">
                          {callback.phone_number}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              scheduled.isOverdue && isPending
                                ? "text-status-error"
                                : "text-text-primary"
                            )}
                          >
                            {scheduled.text}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {date} {time}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(callback.status)} size="sm" outline>
                          {callback.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={getPriorityVariant(callback.priority)} size="sm">
                          {priorityConfig?.label || callback.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-text-secondary">
                          {callback.assigned_agent_name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {isPending && onDial && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDial(callback);
                              }}
                              className="p-2 rounded-lg text-status-success hover:bg-status-success/10 transition-colors"
                              title="Call now"
                            >
                              <svg
                                className="w-4 h-4"
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onComplete(callback);
                              }}
                              className="p-2 rounded-lg text-status-info hover:bg-status-info/10 transition-colors"
                              title="Mark as complete"
                            >
                              <svg
                                className="w-4 h-4"
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(callback);
                              }}
                              className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                              title="Edit callback"
                            >
                              <svg
                                className="w-4 h-4"
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
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancel(callback);
                              }}
                              className="p-2 rounded-lg text-status-error hover:bg-status-error/10 transition-colors"
                              title="Cancel callback"
                            >
                              <svg
                                className="w-4 h-4"
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
                          {!isPending && <span className="text-xs text-text-disabled">-</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-text-secondary">
                Showing {currentPage * pageSize + 1} to{" "}
                {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} callbacks
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-text-secondary">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
