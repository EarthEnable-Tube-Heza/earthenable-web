"use client";

/**
 * Queue Agents Modal Component
 *
 * Modal for managing agents in a call queue.
 * Allows adding, removing, and updating agent settings.
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { CallQueue, QueueAgent } from "@/src/types/voice";
import { apiClient } from "@/src/lib/api";
import {
  useQueueAgents,
  useAddQueueAgent,
  useRemoveQueueAgent,
  useUpdateQueueAgent,
} from "@/src/hooks/useCallCenter";
import { Button, Input, Badge, Spinner } from "@/src/components/ui";

interface QueueAgentsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The queue to manage agents for */
  queue: CallQueue;
}

export function QueueAgentsModal({ isOpen, onClose, queue }: QueueAgentsModalProps) {
  const [userSearch, setUserSearch] = useState("");
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState(1);
  const [editMaxConcurrent, setEditMaxConcurrent] = useState(1);
  const [addPriority, setAddPriority] = useState(1);
  const [addMaxConcurrent, setAddMaxConcurrent] = useState(1);

  // Fetch agents in the queue
  const { data: agents, isLoading: isLoadingAgents } = useQueueAgents(
    isOpen ? queue.id : undefined
  );

  // Fetch available users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-for-queue", userSearch],
    queryFn: () =>
      apiClient.getUsers({
        search: userSearch || undefined,
        limit: 50,
        is_active: true,
      }),
    enabled: isOpen,
  });

  // Mutations
  const addAgentMutation = useAddQueueAgent();
  const removeAgentMutation = useRemoveQueueAgent();
  const updateAgentMutation = useUpdateQueueAgent();

  // Filter out users who are already agents in the queue
  const availableUsers = useMemo(() => {
    if (!usersData?.items || !agents) return [];
    const agentUserIds = agents.map((a) => a.user_id);
    return usersData.items.filter((user) => !agentUserIds.includes(user.id));
  }, [usersData, agents]);

  // Handle adding an agent
  const handleAddAgent = (userId: string) => {
    addAgentMutation.mutate(
      {
        queueId: queue.id,
        data: {
          user_id: userId,
          priority_in_queue: addPriority,
          max_concurrent_calls: addMaxConcurrent,
          is_active: true,
        },
      },
      {
        onSuccess: () => {
          setUserSearch("");
          setAddPriority(1);
          setAddMaxConcurrent(1);
        },
      }
    );
  };

  // Handle removing an agent
  const handleRemoveAgent = (userId: string) => {
    if (confirm("Are you sure you want to remove this agent from the queue?")) {
      removeAgentMutation.mutate({ queueId: queue.id, userId });
    }
  };

  // Handle updating agent settings
  const handleUpdateAgent = (agent: QueueAgent) => {
    updateAgentMutation.mutate(
      {
        queueId: queue.id,
        userId: agent.user_id,
        data: {
          priority_in_queue: editPriority,
          max_concurrent_calls: editMaxConcurrent,
        },
      },
      {
        onSuccess: () => {
          setEditingAgentId(null);
        },
      }
    );
  };

  // Start editing an agent
  const startEditing = (agent: QueueAgent) => {
    setEditingAgentId(agent.user_id);
    setEditPriority(agent.priority_in_queue);
    setEditMaxConcurrent(agent.max_concurrent_calls);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <div>
              <h2 className="text-lg font-heading font-semibold text-text-primary">
                Manage Agents
              </h2>
              <p className="text-sm text-text-secondary">
                {queue.name} ({queue.code})
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-background-light transition-colors"
            >
              <svg
                className="w-5 h-5 text-text-secondary"
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
          </div>

          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {/* Add Agent Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-text-primary mb-3">Add Agent</h3>
              <div className="bg-background-light rounded-lg p-4">
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      leftIcon={
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      }
                    />
                  </div>
                </div>

                {/* Settings for new agent */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">Priority</label>
                    <input
                      type="number"
                      value={addPriority}
                      onChange={(e) => setAddPriority(parseInt(e.target.value) || 1)}
                      min={1}
                      max={100}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1">
                      Max Concurrent Calls
                    </label>
                    <input
                      type="number"
                      value={addMaxConcurrent}
                      onChange={(e) => setAddMaxConcurrent(parseInt(e.target.value) || 1)}
                      min={1}
                      max={10}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* User search results */}
                {isLoadingUsers ? (
                  <div className="text-center py-4">
                    <Spinner size="sm" />
                    <p className="text-xs text-text-secondary mt-1">Loading users...</p>
                  </div>
                ) : userSearch && availableUsers.length === 0 ? (
                  <p className="text-center py-4 text-sm text-text-secondary">
                    No available users found
                  </p>
                ) : userSearch && availableUsers.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableUsers.slice(0, 10).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between py-2 px-3 bg-white rounded-lg hover:bg-background-light transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {user.picture ? (
                            <Image
                              src={user.picture}
                              alt={user.name || "User"}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {(user.name || user.email)?.[0]?.toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {user.name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-text-secondary">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddAgent(user.id)}
                          loading={addAgentMutation.isPending}
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Current Agents Section */}
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-3">
                Current Agents ({agents?.length || 0})
              </h3>

              {isLoadingAgents ? (
                <div className="text-center py-8">
                  <Spinner size="md" />
                  <p className="text-sm text-text-secondary mt-2">Loading agents...</p>
                </div>
              ) : agents && agents.length === 0 ? (
                <div className="text-center py-8 bg-background-light rounded-lg">
                  <svg
                    className="w-12 h-12 text-text-disabled mx-auto mb-2"
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
                  <p className="text-sm text-text-secondary">No agents in this queue yet</p>
                  <p className="text-xs text-text-disabled mt-1">
                    Search for users above to add them
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents?.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between py-3 px-4 bg-background-light rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {(agent.user_name || agent.user_email)?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {agent.user_name || "Unknown User"}
                          </p>
                          <p className="text-xs text-text-secondary">{agent.user_email}</p>
                        </div>
                      </div>

                      {editingAgentId === agent.user_id ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <label className="block text-xs text-text-secondary">Priority</label>
                              <input
                                type="number"
                                value={editPriority}
                                onChange={(e) => setEditPriority(parseInt(e.target.value) || 1)}
                                min={1}
                                max={100}
                                className="w-16 px-2 py-1 text-sm rounded border border-border-light focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-text-secondary">Max Calls</label>
                              <input
                                type="number"
                                value={editMaxConcurrent}
                                onChange={(e) =>
                                  setEditMaxConcurrent(parseInt(e.target.value) || 1)
                                }
                                min={1}
                                max={10}
                                className="w-16 px-2 py-1 text-sm rounded border border-border-light focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateAgent(agent)}
                            loading={updateAgentMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingAgentId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <span>Priority: {agent.priority_in_queue}</span>
                            <span>|</span>
                            <span>Max Calls: {agent.max_concurrent_calls}</span>
                          </div>
                          <Badge variant={agent.is_active ? "success" : "default"} size="sm">
                            {agent.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(agent)}
                              title="Edit settings"
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
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAgent(agent.user_id)}
                              className="text-status-error hover:bg-status-error/10"
                              title="Remove from queue"
                              loading={removeAgentMutation.isPending}
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-border-light">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
