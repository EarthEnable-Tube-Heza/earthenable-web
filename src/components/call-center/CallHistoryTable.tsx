"use client";

/**
 * Call History Table Component
 *
 * Paginated table displaying call logs with filtering and search.
 */

import { cn } from "@/src/lib/theme";
import {
  CallLog,
  CallStatus,
  CallDirection,
  CALL_STATUS_CONFIG,
  formatDuration,
} from "@/src/types/voice";
import { Badge, Spinner, Button } from "@/src/components/ui";

interface CallHistoryTableProps {
  /** Call logs data */
  calls: CallLog[];
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
  /** Callback when a call is selected */
  onSelectCall: (call: CallLog) => void;
  /** Additional class name */
  className?: string;
}

export function CallHistoryTable({
  calls,
  isLoading = false,
  totalCount = 0,
  currentPage,
  pageSize,
  onPageChange,
  onSelectCall,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" label="Loading call history..." />
      </div>
    );
  }

  if (calls.length === 0) {
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
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <p className="text-text-secondary">No calls found</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light">
          <thead className="bg-background-light">
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
          <tbody className="bg-white divide-y divide-border-light">
            {calls.map((call) => {
              const statusConfig = CALL_STATUS_CONFIG[call.status];
              const { date, time } = formatDateTime(call.started_at);
              const phoneNumber =
                call.direction === CallDirection.INBOUND ? call.caller_number : call.callee_number;

              return (
                <tr
                  key={call.id}
                  onClick={() => onSelectCall(call)}
                  className="hover:bg-background-light cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <DirectionIcon direction={call.direction} />
                      <span className="text-xs text-text-secondary capitalize">
                        {call.direction}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-text-primary">{phoneNumber}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-text-secondary">{call.agent_name || "-"}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge
                      variant={
                        call.status === CallStatus.COMPLETED
                          ? "success"
                          : call.status === CallStatus.FAILED || call.status === CallStatus.MISSED
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-text-primary">
                      {call.duration_seconds > 0 ? formatDuration(call.duration_seconds) : "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-text-primary">{date}</span>
                      <span className="text-xs text-text-secondary">{time}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-light">
          <div className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalCount)} of {totalCount} calls
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
