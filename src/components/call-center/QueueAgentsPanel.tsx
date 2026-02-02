"use client";

/**
 * Queue Agents Panel Component
 *
 * Shows other agents in the queue with their current status.
 * Helps agents identify available colleagues for call transfers.
 */

import { useMemo } from "react";
import { useAgentStatuses, useMyQueues, useQueueAgents } from "@/src/hooks/useCallCenter";
import { useAuth } from "@/src/lib/auth";
import { AgentStatus, AgentStatusEnum } from "@/src/types/voice";
import { Badge, Spinner } from "@/src/components/ui";
import { cn } from "@/src/lib/theme";

interface QueueAgentsPanelProps {
  /** Entity ID to fetch agents for */
  entityId?: string;
  /** Callback when an agent is clicked (e.g., to transfer call) */
  onAgentClick?: (agent: AgentStatus) => void;
  /** Callback to call an agent directly (agent-to-agent call) */
  onCallAgent?: (agent: AgentStatus) => void;
  /** Whether calling agents is enabled (e.g., WebRTC connected and available) */
  canCallAgent?: boolean;
  /** Additional class name */
  className?: string;
}

export function QueueAgentsPanel({
  entityId,
  onAgentClick,
  onCallAgent,
  canCallAgent = false,
  className,
}: QueueAgentsPanelProps) {
  const { user } = useAuth();

  // Fetch all agent statuses for the entity
  const {
    data: allAgentStatuses,
    isLoading: isLoadingStatuses,
    error: statusError,
  } = useAgentStatuses(entityId);

  // Fetch queues the current user belongs to
  const { data: myQueues, isLoading: isLoadingQueues } = useMyQueues(entityId);

  // Get the first queue the user is in (primary queue)
  const primaryQueue = myQueues?.[0];

  // Fetch agents in the primary queue
  const { data: queueAgents, isLoading: isLoadingQueueAgents } = useQueueAgents(primaryQueue?.id);

  // Combine queue agents with their statuses, excluding current user
  const agentsWithStatus = useMemo(() => {
    if (!queueAgents || !allAgentStatuses) return [];

    // Create a map of user_id to agent status
    const statusMap = new Map<string, AgentStatus>();
    allAgentStatuses.forEach((status) => {
      statusMap.set(status.user_id, status);
    });

    // Map queue agents to include their status
    return queueAgents
      .filter((agent) => agent.user_id !== user?.id) // Exclude current user
      .map((agent) => ({
        ...agent,
        status: statusMap.get(agent.user_id),
      }))
      .sort((a, b) => {
        // Sort by status priority: available first, then busy, then others
        const statusPriority = (status?: AgentStatus) => {
          if (!status) return 5;
          switch (status.status) {
            case AgentStatusEnum.AVAILABLE:
              return 1;
            case AgentStatusEnum.BUSY:
              return 2;
            case AgentStatusEnum.AFTER_CALL_WORK:
              return 3;
            case AgentStatusEnum.UNAVAILABLE:
              return 4;
            default:
              return 5;
          }
        };
        return statusPriority(a.status) - statusPriority(b.status);
      });
  }, [queueAgents, allAgentStatuses, user?.id]);

  // Get status badge variant and label
  const getStatusInfo = (
    status?: AgentStatusEnum
  ): { variant: "success" | "warning" | "error" | "default"; label: string } => {
    switch (status) {
      case AgentStatusEnum.AVAILABLE:
        return { variant: "success", label: "Available" };
      case AgentStatusEnum.BUSY:
        return { variant: "error", label: "On Call" };
      case AgentStatusEnum.AFTER_CALL_WORK:
        return { variant: "warning", label: "Wrap Up" };
      case AgentStatusEnum.UNAVAILABLE:
        return { variant: "default", label: "Unavailable" };
      case AgentStatusEnum.OFFLINE:
      default:
        return { variant: "default", label: "Offline" };
    }
  };

  // Get status indicator color
  const getStatusColor = (status?: AgentStatusEnum): string => {
    switch (status) {
      case AgentStatusEnum.AVAILABLE:
        return "bg-status-success";
      case AgentStatusEnum.BUSY:
        return "bg-status-error";
      case AgentStatusEnum.AFTER_CALL_WORK:
        return "bg-status-warning";
      case AgentStatusEnum.UNAVAILABLE:
        return "bg-text-secondary";
      default:
        return "bg-text-disabled";
    }
  };

  const isLoading = isLoadingStatuses || isLoadingQueues || isLoadingQueueAgents;

  if (isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[150px]", className)}>
        <Spinner size="sm" />
        <span className="mt-2 text-sm text-text-secondary">Loading agents...</span>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[150px]", className)}>
        <p className="text-sm text-status-error">Failed to load agents</p>
      </div>
    );
  }

  if (!primaryQueue) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[150px]", className)}>
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-sm text-text-disabled">Not assigned to a queue</p>
      </div>
    );
  }

  if (agentsWithStatus.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[150px]", className)}>
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-sm text-text-disabled">No other agents in queue</p>
      </div>
    );
  }

  // Count available agents
  const availableCount = agentsWithStatus.filter(
    (a) => a.status?.status === AgentStatusEnum.AVAILABLE
  ).length;

  return (
    <div className={cn("", className)}>
      {/* Queue name and available count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-text-secondary">{primaryQueue.name}</span>
        <Badge variant={availableCount > 0 ? "success" : "default"} size="sm">
          {availableCount} available
        </Badge>
      </div>

      {/* Agent list */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {agentsWithStatus.map((agent) => {
          const statusInfo = getStatusInfo(agent.status?.status);
          const isAvailable = agent.status?.status === AgentStatusEnum.AVAILABLE;

          return (
            <div
              key={agent.id}
              className={cn(
                "p-3 rounded-lg bg-background-light transition-colors flex items-center justify-between",
                onAgentClick && isAvailable && "hover:bg-border-light cursor-pointer",
                !isAvailable && "opacity-60"
              )}
              onClick={() => isAvailable && agent.status && onAgentClick?.(agent.status)}
            >
              <div className="flex items-center gap-3">
                {/* Status indicator */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {(agent.user_name || agent.user_email)?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                      getStatusColor(agent.status?.status)
                    )}
                  />
                </div>

                {/* Agent info */}
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {agent.user_name || "Unknown Agent"}
                  </p>
                  <p className="text-xs text-text-secondary">{statusInfo.label}</p>
                </div>
              </div>

              {/* Action buttons for available agents */}
              {isAvailable && (onAgentClick || onCallAgent) && (
                <div className="flex items-center gap-1.5">
                  {/* Call agent button */}
                  {onCallAgent && canCallAgent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (agent.status) {
                          onCallAgent(agent.status);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-status-success/10 text-status-success hover:bg-status-success/20 transition-colors"
                      title="Call agent"
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
                  {/* Transfer call button */}
                  {onAgentClick && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (agent.status) {
                          onAgentClick(agent.status);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Transfer call"
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
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
