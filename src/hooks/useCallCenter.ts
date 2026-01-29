/**
 * Call Center Hooks
 *
 * React Query hooks for call center management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/src/lib/api";
import {
  VoiceSettingsCreate,
  VoiceSettingsUpdate,
  CallQueueCreate,
  CallQueueUpdate,
  QueueAgentAdd,
  AgentStatusEnum,
  CallLogFilters,
  CallbackCreate,
  CallbackUpdate,
  CallbackFilters,
  DialRequest,
} from "@/src/types";

// ==================== Query Keys ====================

export const voiceQueryKeys = {
  all: ["voice"] as const,
  // Settings
  settings: (entityId: string) => [...voiceQueryKeys.all, "settings", entityId] as const,
  // Queues
  queues: (filters?: { entity_id?: string; is_active?: boolean }) =>
    [...voiceQueryKeys.all, "queues", filters] as const,
  queue: (queueId: string) => [...voiceQueryKeys.all, "queue", queueId] as const,
  queueAgents: (queueId: string) => [...voiceQueryKeys.all, "queue-agents", queueId] as const,
  // Calls
  calls: (filters?: CallLogFilters) => [...voiceQueryKeys.all, "calls", filters] as const,
  call: (callId: string) => [...voiceQueryKeys.all, "call", callId] as const,
  callRecording: (callId: string) => [...voiceQueryKeys.all, "call-recording", callId] as const,
  // Callbacks
  callbacks: (filters?: CallbackFilters) => [...voiceQueryKeys.all, "callbacks", filters] as const,
  callback: (callbackId: string) => [...voiceQueryKeys.all, "callback", callbackId] as const,
  // Agent Status
  agentStatuses: (entityId?: string) =>
    [...voiceQueryKeys.all, "agent-statuses", entityId] as const,
  // Stats
  stats: (entityId: string, days?: number) =>
    [...voiceQueryKeys.all, "stats", entityId, days] as const,
  queueStats: (entityId: string) => [...voiceQueryKeys.all, "queue-stats", entityId] as const,
  agentStats: (entityId: string, days?: number) =>
    [...voiceQueryKeys.all, "agent-stats", entityId, days] as const,
  // Agent self-service
  myStatus: () => [...voiceQueryKeys.all, "my-status"] as const,
  myQueues: () => [...voiceQueryKeys.all, "my-queues"] as const,
  myActiveCall: () => [...voiceQueryKeys.all, "my-active-call"] as const,
  myCallbacks: () => [...voiceQueryKeys.all, "my-callbacks"] as const,
  myCallHistory: (limit?: number) => [...voiceQueryKeys.all, "my-call-history", limit] as const,
  webrtcConfig: () => [...voiceQueryKeys.all, "webrtc-config"] as const,
};

// ==================== Voice Settings Hooks ====================

/**
 * Hook to get voice settings for an entity
 */
export function useVoiceSettings(entityId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.settings(entityId || ""),
    queryFn: () => apiClient.getVoiceSettings(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to create voice settings
 */
export function useCreateVoiceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VoiceSettingsCreate) => apiClient.createVoiceSettings(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: voiceQueryKeys.settings(variables.entity_id),
      });
    },
  });
}

/**
 * Hook to update voice settings
 */
export function useUpdateVoiceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityId, data }: { entityId: string; data: VoiceSettingsUpdate }) =>
      apiClient.updateVoiceSettings(entityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: voiceQueryKeys.settings(variables.entityId),
      });
    },
  });
}

/**
 * Hook to test voice settings
 */
export function useTestVoiceSettings() {
  return useMutation({
    mutationFn: ({ entityId, phoneNumber }: { entityId: string; phoneNumber: string }) =>
      apiClient.testVoiceSettings(entityId, phoneNumber),
  });
}

// ==================== Call Queue Hooks ====================

/**
 * Hook to get call queues
 */
export function useCallQueues(filters?: { entity_id?: string; is_active?: boolean }) {
  return useQuery({
    queryKey: voiceQueryKeys.queues(filters),
    queryFn: () => apiClient.getCallQueues(filters),
  });
}

/**
 * Hook to get a specific call queue
 */
export function useCallQueue(queueId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.queue(queueId || ""),
    queryFn: () => apiClient.getCallQueue(queueId!),
    enabled: !!queueId,
  });
}

/**
 * Hook to create a call queue
 */
export function useCreateCallQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CallQueueCreate) => apiClient.createCallQueue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.queues() });
    },
  });
}

/**
 * Hook to update a call queue
 */
export function useUpdateCallQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueId, data }: { queueId: string; data: CallQueueUpdate }) =>
      apiClient.updateCallQueue(queueId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.queues() });
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.queue(variables.queueId) });
    },
  });
}

/**
 * Hook to delete a call queue
 */
export function useDeleteCallQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueId: string) => apiClient.deleteCallQueue(queueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.queues() });
    },
  });
}

// ==================== Queue Agent Hooks ====================

/**
 * Hook to get agents in a queue
 */
export function useQueueAgents(queueId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.queueAgents(queueId || ""),
    queryFn: () => apiClient.getQueueAgents(queueId!),
    enabled: !!queueId,
  });
}

/**
 * Hook to add an agent to a queue
 */
export function useAddQueueAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueId, data }: { queueId: string; data: QueueAgentAdd }) =>
      apiClient.addQueueAgent(queueId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.queueAgents(variables.queueId) });
    },
  });
}

/**
 * Hook to remove an agent from a queue
 */
export function useRemoveQueueAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ queueId, userId }: { queueId: string; userId: string }) =>
      apiClient.removeQueueAgent(queueId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.queueAgents(variables.queueId) });
    },
  });
}

/**
 * Hook to update an agent's settings in a queue
 */
export function useUpdateQueueAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      queueId,
      userId,
      data,
    }: {
      queueId: string;
      userId: string;
      data: { priority_in_queue?: number; is_active?: boolean; max_concurrent_calls?: number };
    }) => apiClient.updateQueueAgent(queueId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.queueAgents(variables.queueId) });
    },
  });
}

// ==================== Call Log Hooks ====================

/**
 * Hook to get call logs with pagination and filters
 */
export function useCallLogs(filters?: CallLogFilters) {
  return useQuery({
    queryKey: voiceQueryKeys.calls(filters),
    queryFn: () => apiClient.getCallLogs(filters),
  });
}

/**
 * Hook to get a specific call detail
 */
export function useCallDetail(callId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.call(callId || ""),
    queryFn: () => apiClient.getCallDetail(callId!),
    enabled: !!callId,
  });
}

/**
 * Hook to get call recording URL
 */
export function useCallRecordingUrl(callId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.callRecording(callId || ""),
    queryFn: () => apiClient.getCallRecordingUrl(callId!),
    enabled: !!callId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook to update call notes
 */
export function useUpdateCallNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ callId, notes }: { callId: string; notes: string }) =>
      apiClient.updateCallNotes(callId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.call(variables.callId) });
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.calls() });
    },
  });
}

// ==================== Callback Hooks ====================

/**
 * Hook to get callbacks with pagination and filters
 */
export function useCallbacks(filters?: CallbackFilters) {
  return useQuery({
    queryKey: voiceQueryKeys.callbacks(filters),
    queryFn: () => apiClient.getCallbacks(filters),
  });
}

/**
 * Hook to get a specific callback
 */
export function useCallback(callbackId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.callback(callbackId || ""),
    queryFn: () => apiClient.getCallback(callbackId!),
    enabled: !!callbackId,
  });
}

/**
 * Hook to create a callback
 */
export function useCreateCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CallbackCreate) => apiClient.createCallback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.callbacks() });
    },
  });
}

/**
 * Hook to update a callback
 */
export function useUpdateCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ callbackId, data }: { callbackId: string; data: CallbackUpdate }) =>
      apiClient.updateCallback(callbackId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.callbacks() });
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.callback(variables.callbackId) });
    },
  });
}

/**
 * Hook to cancel a callback
 */
export function useCancelCallback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callbackId: string) => apiClient.cancelCallback(callbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.callbacks() });
    },
  });
}

// ==================== Agent Status Hooks (Admin) ====================

/**
 * Hook to get all agent statuses
 */
export function useAgentStatuses(entityId?: string) {
  return useQuery({
    queryKey: voiceQueryKeys.agentStatuses(entityId),
    queryFn: () => apiClient.getAgentStatuses(entityId),
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

/**
 * Hook to set agent status (admin)
 */
export function useSetAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AgentStatusEnum }) =>
      apiClient.setAgentStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.agentStatuses() });
    },
  });
}

// ==================== Statistics Hooks ====================

/**
 * Hook to get call center statistics
 */
export function useCallCenterStats(entityId: string | undefined, days: number = 30) {
  return useQuery({
    queryKey: voiceQueryKeys.stats(entityId || "", days),
    queryFn: () => apiClient.getCallCenterStats(entityId!, days),
    enabled: !!entityId,
  });
}

/**
 * Hook to get queue statistics
 */
export function useQueueStats(entityId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.queueStats(entityId || ""),
    queryFn: () => apiClient.getQueueStats(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to get agent statistics
 */
export function useAgentStatsReport(entityId: string | undefined, days: number = 7) {
  return useQuery({
    queryKey: voiceQueryKeys.agentStats(entityId || "", days),
    queryFn: () => apiClient.getAgentStats(entityId!, days),
    enabled: !!entityId,
  });
}

// ==================== Admin Call Initiation ====================

/**
 * Hook to initiate an outbound call (admin)
 */
export function useInitiateCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DialRequest) => apiClient.initiateCall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.calls() });
    },
  });
}

// ==================== Agent Self-Service Hooks ====================

/**
 * Hook to get current agent's status
 */
export function useMyAgentStatus(entityId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.myStatus(),
    queryFn: () => apiClient.getMyAgentStatus(entityId!),
    enabled: !!entityId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

/**
 * Hook to update current agent's status
 */
export function useUpdateMyAgentStatus(entityId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: AgentStatusEnum) => apiClient.updateMyAgentStatus(entityId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myStatus() });
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.agentStatuses() });
    },
  });
}

/**
 * Hook to get queues the agent is assigned to
 */
export function useMyQueues(entityId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.myQueues(),
    queryFn: () => apiClient.getMyQueues(entityId!),
    enabled: !!entityId,
  });
}

/**
 * Hook to get current agent's active call
 */
export function useMyActiveCall(entityId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.myActiveCall(),
    queryFn: () => apiClient.getMyActiveCall(entityId!),
    enabled: !!entityId,
    refetchInterval: 2000, // Poll every 2 seconds
  });
}

/**
 * Hook to dial a number
 */
export function useDialNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DialRequest) => apiClient.dialNumber(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myActiveCall() });
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myStatus() });
    },
  });
}

/**
 * Hook to end current call
 */
export function useEndCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => apiClient.endCall(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myActiveCall() });
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myStatus() });
    },
  });
}

/**
 * Hook to hold call
 */
export function useHoldCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => apiClient.holdCall(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myActiveCall() });
    },
  });
}

/**
 * Hook to resume call from hold
 */
export function useResumeCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (callId: string) => apiClient.resumeCall(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myActiveCall() });
    },
  });
}

/**
 * Hook to transfer call
 */
export function useTransferCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      callId,
      target,
      transferType,
    }: {
      callId: string;
      target: string;
      transferType?: "cold" | "warm";
    }) => apiClient.transferCall(callId, target, transferType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myActiveCall() });
      queryClient.invalidateQueries({ queryKey: voiceQueryKeys.myStatus() });
    },
  });
}

/**
 * Hook to get callbacks assigned to current agent
 */
export function useMyCallbacks(entityId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.myCallbacks(),
    queryFn: () => apiClient.getMyCallbacks(entityId!),
    enabled: !!entityId,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

/**
 * Hook to get agent's recent call history
 */
export function useMyCallHistory(entityId: string | undefined, limit: number = 20) {
  return useQuery({
    queryKey: voiceQueryKeys.myCallHistory(limit),
    queryFn: () => apiClient.getMyCallHistory(entityId!, limit),
    enabled: !!entityId,
  });
}

/**
 * Hook to get WebRTC configuration
 */
export function useWebRTCConfig(entityId: string | undefined) {
  return useQuery({
    queryKey: voiceQueryKeys.webrtcConfig(),
    queryFn: () => apiClient.getWebRTCConfig(entityId!),
    enabled: !!entityId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
