"use client";

/**
 * Queue Table Component
 *
 * Paginated table displaying call queues with CRUD actions.
 * Follows the same pattern as CallHistoryTable.
 */

import { cn } from "@/src/lib/theme";
import {
  CallQueue,
  RingStrategy,
  OverflowAction,
  RING_STRATEGY_OPTIONS,
  OVERFLOW_ACTION_OPTIONS,
} from "@/src/types/voice";
import { Badge, Button } from "@/src/components/ui";

interface QueueTableProps {
  /** Queue data */
  queues: CallQueue[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Error if any */
  error?: Error | null;
  /** Callback when edit is clicked */
  onEdit: (queue: CallQueue) => void;
  /** Callback when manage agents is clicked */
  onManageAgents: (queue: CallQueue) => void;
  /** Callback when delete is clicked */
  onDelete: (queue: CallQueue) => void;
  /** Callback to retry on error */
  onRetry?: () => void;
  /** Additional class name */
  className?: string;
}

export function QueueTable({
  queues,
  isLoading = false,
  error = null,
  onEdit,
  onManageAgents,
  onDelete,
  onRetry,
  className,
}: QueueTableProps) {
  // Helper to get ring strategy label
  const getRingStrategyLabel = (strategy: RingStrategy): string => {
    const option = RING_STRATEGY_OPTIONS.find((o) => o.value === strategy);
    return option?.label || strategy;
  };

  // Helper to get overflow action label
  const getOverflowActionLabel = (action: OverflowAction): string => {
    const option = OVERFLOW_ACTION_OPTIONS.find((o) => o.value === action);
    return option?.label || action;
  };

  // Format wait time
  const formatWaitTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-medium overflow-hidden", className)}>
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-text-secondary mt-2">Loading queues...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-status-error">Error loading queues. Please try again.</p>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4">
              Retry
            </Button>
          )}
        </div>
      ) : queues.length === 0 ? (
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-text-secondary">No queues found.</p>
          <p className="text-text-disabled text-sm mt-1">Create your first queue to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-background-light border-b border-border-light">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Strategy
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Max Wait
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Overflow
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Agents
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {queues.map((queue) => (
                <tr key={queue.id} className="hover:bg-background-light transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-primary">{queue.name}</span>
                      {queue.description && (
                        <span className="text-xs text-text-secondary truncate max-w-[200px]">
                          {queue.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-text-secondary">{queue.code}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-text-primary">
                      {getRingStrategyLabel(queue.ring_strategy)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-text-primary">
                      {formatWaitTime(queue.max_wait_time_seconds)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-text-primary">
                      {getOverflowActionLabel(queue.overflow_action)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant="default" size="sm">
                      {queue.agent_count ?? 0} agents
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge variant={queue.is_active ? "success" : "default"} size="sm">
                      {queue.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(queue)} title="Edit">
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
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManageAgents(queue)}
                        title="Manage Agents"
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(queue)}
                        title="Delete"
                        className="text-status-error hover:bg-status-error/10"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
