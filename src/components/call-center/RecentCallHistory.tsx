"use client";

/**
 * Recent Call History Component
 *
 * Displays the agent's most recent calls in a compact list format.
 * Designed for the workspace sidebar to provide quick call history access.
 */

import { useMyCallHistory } from "@/src/hooks/useCallCenter";
import { CallLog, CallDirection, CallStatus } from "@/src/types/voice";
import { Badge, Spinner } from "@/src/components/ui";
import { cn } from "@/src/lib/theme";

interface RecentCallHistoryProps {
  /** Entity ID to fetch calls for */
  entityId?: string;
  /** Number of recent calls to show */
  limit?: number;
  /** Callback when a call is clicked (e.g., to redial) */
  onCallClick?: (call: CallLog) => void;
  /** Additional class name */
  className?: string;
}

export function RecentCallHistory({
  entityId,
  limit = 5,
  onCallClick,
  className,
}: RecentCallHistoryProps) {
  const { data: callsData, isLoading, error } = useMyCallHistory(entityId, limit);

  // Handle both array response and wrapped response (items array)
  const calls = Array.isArray(callsData)
    ? callsData
    : ((callsData as { items?: CallLog[] } | undefined)?.items ?? []);

  // Format duration to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Get status badge variant
  const getStatusVariant = (status: CallStatus): "success" | "error" | "warning" | "default" => {
    switch (status) {
      case CallStatus.COMPLETED:
        return "success";
      case CallStatus.FAILED:
      case CallStatus.MISSED:
      case CallStatus.BUSY:
        return "error";
      case CallStatus.NO_ANSWER:
        return "warning";
      default:
        return "default";
    }
  };

  // Get direction icon
  const DirectionIcon = ({ direction }: { direction: CallDirection }) => {
    if (direction === CallDirection.INBOUND) {
      return (
        <svg
          className="w-4 h-4 text-blue-500"
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3l-6 6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 11l7-7" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 11V4h-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Spinner size="sm" />
        <span className="ml-2 text-sm text-text-secondary">Loading calls...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-sm text-status-error">Failed to load call history</p>
      </div>
    );
  }

  if (!calls || calls.length === 0) {
    return (
      <div
        className={cn("flex flex-col items-center justify-center h-full min-h-[120px]", className)}
      >
        <svg
          className="w-10 h-10 text-text-disabled mb-2"
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
        <p className="text-sm text-text-disabled">No recent calls</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {calls.map((call) => {
        const phoneNumber =
          call.direction === CallDirection.INBOUND ? call.caller_number : call.callee_number;

        return (
          <div
            key={call.id}
            className={cn(
              "p-3 rounded-lg bg-background-light transition-colors",
              onCallClick && "hover:bg-border-light cursor-pointer"
            )}
            onClick={() => onCallClick?.(call)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <DirectionIcon direction={call.direction} />
                <span className="font-medium text-sm text-text-primary">
                  {call.agent_name || phoneNumber}
                </span>
              </div>
              <Badge variant={getStatusVariant(call.status)} size="sm">
                {call.status.replace("_", " ")}
              </Badge>
            </div>

            {call.agent_name && <p className="text-xs text-text-secondary ml-6">{phoneNumber}</p>}

            <div className="flex items-center justify-between mt-2 ml-6">
              <span className="text-xs text-text-disabled">{formatTimeAgo(call.started_at)}</span>
              {call.duration_seconds > 0 && (
                <span className="text-xs text-text-secondary">
                  {formatDuration(call.duration_seconds)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
