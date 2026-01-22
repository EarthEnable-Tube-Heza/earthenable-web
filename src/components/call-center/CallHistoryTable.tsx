"use client";

/**
 * Call History Table Component
 *
 * Paginated table displaying call logs with filtering and search.
 * Follows the same pattern as the Tasks page table.
 */

import { cn } from "@/src/lib/theme";
import {
  CallLog,
  CallStatus,
  CallDirection,
  CALL_STATUS_CONFIG,
  formatDuration,
} from "@/src/types/voice";
import { Badge, Button } from "@/src/components/ui";

interface CallHistoryTableProps {
  /** Call logs data */
  calls: CallLog[];
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
  /** Callback when a call is selected */
  onSelectCall: (call: CallLog) => void;
  /** Callback to retry on error */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

export function CallHistoryTable({
  calls,
  isLoading = false,
  error = null,
  totalCount = 0,
  currentPage,
  pageSize,
  onPageChange,
  onSelectCall,
  onRetry,
  className,
}: CallHistoryTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Direction icon
  const DirectionIcon = ({ direction }: { direction: CallDirection }) =>
    direction === CallDirection.INBOUND ? (
      <svg
        className="w-4 h-4 text-status-info"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-status-success"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    );

  // Format date/time
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-medium overflow-hidden", className)}>
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-text-secondary mt-2">Loading call history...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-status-error">Error loading call history. Please try again.</p>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4">
              Retry
            </Button>
          )}
        </div>
      ) : calls.length === 0 ? (
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <p className="text-text-secondary">No calls found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-background-light border-b border-border-light">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Recording
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {calls.map((call) => {
                  const statusConfig = CALL_STATUS_CONFIG[call.status];
                  const { date, time } = formatDateTime(call.started_at);
                  const phoneNumber =
                    call.direction === CallDirection.INBOUND
                      ? call.caller_number
                      : call.callee_number;

                  return (
                    <tr
                      key={call.id}
                      onClick={() => onSelectCall(call)}
                      className="hover:bg-background-light cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DirectionIcon direction={call.direction} />
                          <span className="text-xs text-text-secondary capitalize">
                            {call.direction}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-text-primary">{phoneNumber}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-text-secondary">
                          {call.agent_name || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            call.status === CallStatus.COMPLETED
                              ? "success"
                              : call.status === CallStatus.FAILED ||
                                  call.status === CallStatus.MISSED
                                ? "error"
                                : call.status === CallStatus.IN_PROGRESS
                                  ? "info"
                                  : "default"
                          }
                          size="sm"
                        >
                          {statusConfig?.label || call.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-text-primary">
                          {call.duration_seconds > 0 ? formatDuration(call.duration_seconds) : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-text-primary">{date}</span>
                          <span className="text-xs text-text-secondary">{time}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {call.recording_url ? (
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                            />
                          </svg>
                        ) : (
                          <span className="text-xs text-text-disabled">-</span>
                        )}
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
                {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} calls
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
