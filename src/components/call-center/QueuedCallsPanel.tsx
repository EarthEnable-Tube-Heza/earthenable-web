"use client";

/**
 * Queued Calls Panel
 *
 * Displays calls currently waiting in the queue.
 * Shows caller information, wait time, and queue name.
 */

import { cn } from "@/src/lib/theme";
import { useQueuedCalls } from "@/src/hooks/useCallCenter";
import { CallLog, CallStatus, formatDuration } from "@/src/types/voice";
import { Badge, Spinner } from "@/src/components/ui";
import { Phone, Clock, Users } from "@/src/lib/icons";

interface QueuedCallsPanelProps {
  /** Entity ID to fetch queued calls for */
  entityId?: string;
  /** Callback when a queued call is clicked */
  onCallClick?: (call: CallLog) => void;
  /** Additional class name */
  className?: string;
}

export function QueuedCallsPanel({ entityId, onCallClick, className }: QueuedCallsPanelProps) {
  const { data: queuedCallsData, isLoading, error } = useQueuedCalls(entityId);

  const queuedCalls = queuedCallsData?.items || [];

  // Calculate wait time from started_at
  const getWaitTime = (startedAt: string): number => {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
  };

  // Get status badge variant
  const getStatusVariant = (status: CallStatus): "warning" | "info" | "default" => {
    switch (status) {
      case CallStatus.QUEUED:
        return "warning";
      case CallStatus.RINGING:
        return "info";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-6 text-text-secondary text-sm", className)}>
        Unable to load queue
      </div>
    );
  }

  if (queuedCalls.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <div className="w-12 h-12 rounded-full bg-status-success/10 flex items-center justify-center mb-3">
          <Users className="w-6 h-6 text-status-success" />
        </div>
        <p className="text-sm font-medium text-text-primary">Queue is empty</p>
        <p className="text-xs text-text-disabled mt-1">No callers waiting</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {queuedCalls.map((call) => {
        const waitTime = getWaitTime(call.started_at);
        const isLongWait = waitTime > 60; // More than 1 minute

        return (
          <div
            key={call.id}
            className={cn(
              "p-3 rounded-lg transition-colors",
              isLongWait
                ? "bg-status-warning/10 border border-status-warning/30"
                : "bg-background-light hover:bg-border-light",
              onCallClick && "cursor-pointer"
            )}
            onClick={() => onCallClick?.(call)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    call.status === CallStatus.RINGING
                      ? "bg-status-info/20 animate-pulse"
                      : "bg-primary/10"
                  )}
                >
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-text-primary text-sm truncate">
                    {call.caller_number}
                  </p>
                  {call.queue_name && (
                    <p className="text-xs text-text-secondary truncate">{call.queue_name}</p>
                  )}
                </div>
              </div>
              <Badge variant={getStatusVariant(call.status)} size="sm">
                {call.status === CallStatus.RINGING ? "Ringing" : "Waiting"}
              </Badge>
            </div>

            {/* Wait time */}
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <Clock
                className={cn(
                  "w-3.5 h-3.5",
                  isLongWait ? "text-status-warning" : "text-text-disabled"
                )}
              />
              <span
                className={cn(
                  isLongWait ? "text-status-warning font-medium" : "text-text-disabled"
                )}
              >
                Waiting {formatDuration(waitTime)}
              </span>
            </div>
          </div>
        );
      })}

      {/* Summary */}
      {queuedCalls.length > 0 && (
        <div className="pt-2 border-t border-border-light">
          <p className="text-xs text-text-disabled text-center">
            {queuedCalls.length} caller{queuedCalls.length !== 1 ? "s" : ""} in queue
          </p>
        </div>
      )}
    </div>
  );
}
