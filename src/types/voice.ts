/**
 * Voice/Call Center Types
 *
 * TypeScript types for call center management with Africa's Talking Voice API.
 */

// ==================== Enums ====================

export enum AgentStatusEnum {
  AVAILABLE = "available",
  BUSY = "busy",
  AFTER_CALL_WORK = "after_call_work",
  UNAVAILABLE = "unavailable",
  OFFLINE = "offline",
}

export enum CallDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
}

export enum CallStatus {
  QUEUED = "queued",
  RINGING = "ringing",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  MISSED = "missed",
  BUSY = "busy",
  NO_ANSWER = "no_answer",
  VOICEMAIL = "voicemail",
}

export enum RingStrategy {
  ROUND_ROBIN = "round_robin",
  LONGEST_IDLE = "longest_idle",
  RING_ALL = "ring_all",
  RANDOM = "random",
}

export enum OverflowAction {
  VOICEMAIL = "voicemail",
  CALLBACK = "callback",
  TRANSFER_QUEUE = "transfer_queue",
}

export enum CallbackStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum CallbackPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

// ==================== Voice Settings ====================

export interface VoiceSettings {
  id: string;
  entity_id: string;
  provider: string;
  api_username?: string;
  phone_numbers: string[];
  recording_enabled: boolean;
  recording_storage_url?: string;
  callback_base_url?: string;
  is_enabled: boolean;
  use_sandbox: boolean;
  webrtc_enabled: boolean;
  daily_call_limit: number;
  monthly_call_limit: number;
  daily_calls_made: number;
  monthly_calls_made: number;
  cost_per_minute: number;
  currency: string;
  is_configured: boolean;
  daily_remaining: number;
  monthly_remaining: number;
  /** ACW timeout in seconds - 0 means no auto-transition */
  acw_timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface VoiceSettingsCreate {
  entity_id: string;
  provider?: string;
  api_key?: string;
  api_username?: string;
  phone_numbers?: string[];
  recording_enabled?: boolean;
  recording_storage_url?: string;
  callback_base_url?: string;
  is_enabled?: boolean;
  use_sandbox?: boolean;
  webrtc_enabled?: boolean;
  daily_call_limit?: number;
  monthly_call_limit?: number;
  cost_per_minute?: number;
  currency?: string;
  /** ACW timeout in seconds - 0 means no auto-transition */
  acw_timeout_seconds?: number;
}

export interface VoiceSettingsUpdate {
  api_key?: string;
  api_username?: string;
  phone_numbers?: string[];
  recording_enabled?: boolean;
  recording_storage_url?: string;
  callback_base_url?: string;
  is_enabled?: boolean;
  use_sandbox?: boolean;
  webrtc_enabled?: boolean;
  daily_call_limit?: number;
  monthly_call_limit?: number;
  cost_per_minute?: number;
  currency?: string;
  /** ACW timeout in seconds - 0 means no auto-transition */
  acw_timeout_seconds?: number;
}

// ==================== Call Queues ====================

export interface CallQueue {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  description?: string;
  ring_strategy: RingStrategy;
  max_wait_time_seconds: number;
  overflow_action: OverflowAction;
  overflow_queue_id?: string;
  music_on_hold_url?: string;
  welcome_message_url?: string;
  business_hours_config?: Record<string, unknown>;
  is_active: boolean;
  priority: number;
  agent_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CallQueueCreate {
  entity_id: string;
  name: string;
  code: string;
  description?: string;
  ring_strategy?: RingStrategy;
  max_wait_time_seconds?: number;
  overflow_action?: OverflowAction;
  overflow_queue_id?: string;
  music_on_hold_url?: string;
  welcome_message_url?: string;
  business_hours_config?: Record<string, unknown>;
  is_active?: boolean;
  priority?: number;
}

export interface CallQueueUpdate {
  name?: string;
  description?: string;
  ring_strategy?: RingStrategy;
  max_wait_time_seconds?: number;
  overflow_action?: OverflowAction;
  overflow_queue_id?: string;
  music_on_hold_url?: string;
  welcome_message_url?: string;
  business_hours_config?: Record<string, unknown>;
  is_active?: boolean;
  priority?: number;
}

// ==================== Queue Agents ====================

export interface QueueAgent {
  id: string;
  queue_id: string;
  user_id: string;
  priority_in_queue: number;
  is_active: boolean;
  max_concurrent_calls: number;
  joined_at: string;
  user_name?: string;
  user_email?: string;
}

export interface QueueAgentAdd {
  user_id: string;
  priority_in_queue?: number;
  is_active?: boolean;
  max_concurrent_calls?: number;
}

export interface QueueAgentUpdate {
  priority_in_queue?: number;
  is_active?: boolean;
  max_concurrent_calls?: number;
}

// ==================== Agent Status ====================

export interface AgentStatus {
  id: string;
  user_id: string;
  entity_id: string;
  status: AgentStatusEnum;
  status_changed_at: string;
  current_call_id?: string;
  last_call_ended_at?: string;
  auto_answer_enabled: boolean;
  user_name?: string;
  user_email?: string;
}

export interface AgentStatusUpdate {
  status: AgentStatusEnum;
}

// ==================== Call Logs ====================

export interface CallLog {
  id: string;
  entity_id: string;
  session_id: string;
  direction: CallDirection;
  caller_number: string;
  callee_number: string;
  queue_id?: string;
  queue_name?: string;
  agent_user_id?: string;
  agent_name?: string;
  status: CallStatus;
  started_at: string;
  answered_at?: string;
  ended_at?: string;
  duration_seconds: number;
  wait_time_seconds: number;
  hangup_cause?: string;
  recording_url?: string;
  recording_duration_seconds?: number;
  cost?: number;
  currency?: string;
  linked_task_id?: string;
  linked_contact_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CallLogFilters {
  entity_id?: string;
  direction?: CallDirection | string; // Can be single value or comma-separated for multi-select
  status?: CallStatus | string; // Can be single value or comma-separated for multi-select
  agent_user_id?: string;
  queue_id?: string;
  has_recording?: boolean;
  date_from?: string;
  date_to?: string;
  phone_number?: string;
  skip?: number;
  limit?: number;
}

export interface PaginatedCallLogsResponse {
  items: CallLog[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface CallDetail extends CallLog {
  events?: CallEvent[];
}

export interface CallEvent {
  timestamp: string;
  event_type: string;
  description: string;
  data?: Record<string, unknown>;
}

// ==================== Call Callbacks ====================

export interface CallCallback {
  id: string;
  entity_id: string;
  phone_number: string;
  contact_name?: string;
  linked_contact_id?: string;
  scheduled_at: string;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  queue_id?: string;
  queue_name?: string;
  status: CallbackStatus;
  priority: CallbackPriority;
  notes?: string;
  created_by: string;
  created_by_name?: string;
  completed_at?: string;
  result_call_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CallbackCreate {
  entity_id: string;
  phone_number: string;
  contact_name?: string;
  linked_contact_id?: string;
  scheduled_at: string;
  assigned_agent_id?: string;
  queue_id?: string;
  priority?: CallbackPriority;
  notes?: string;
}

export interface CallbackUpdate {
  phone_number?: string;
  contact_name?: string;
  scheduled_at?: string;
  assigned_agent_id?: string;
  queue_id?: string;
  priority?: CallbackPriority;
  notes?: string;
  status?: CallbackStatus;
}

export interface CallbackFilters {
  entity_id?: string;
  status?: CallbackStatus | string; // Can be single value or comma-separated for multi-select
  assigned_agent_id?: string;
  queue_id?: string;
  priority?: CallbackPriority | string; // Can be single value or comma-separated for multi-select
  scheduled_from?: string;
  scheduled_to?: string;
  skip?: number;
  limit?: number;
}

export interface PaginatedCallbacksResponse {
  items: CallCallback[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// ==================== Call Initiation ====================

export interface DialRequest {
  entity_id: string;
  phone_number: string;
  from_number?: string;
  linked_task_id?: string;
  linked_contact_id?: string;
}

export interface CallInitiateResponse {
  success: boolean;
  message: string;
  call_id?: string;
  session_id?: string;
  status?: CallStatus;
}

// ==================== WebRTC Configuration ====================

export interface WebRTCConfig {
  token: string; // Capability token from Africa's Talking
  client_name: string; // Unique client identifier
  phone_number: string; // Phone number for this agent
}

// ==================== Statistics ====================

export interface QueueStatsResponse {
  queue_id: string;
  queue_name: string;
  calls_waiting: number;
  agents_available: number;
  agents_busy: number;
  average_wait_seconds: number;
  longest_wait_seconds: number;
}

export interface CallCenterStats {
  entity_id: string;
  period_days: number;
  total_calls: number;
  inbound_calls: number;
  outbound_calls: number;
  completed_calls: number;
  missed_calls: number;
  failed_calls: number;
  total_talk_time_seconds: number;
  average_call_duration_seconds: number;
  average_wait_time_seconds: number;
  total_cost: number;
  currency: string;
  total_agents: number;
  agents_online: number;
  agents_available: number;
  agents_busy: number;
  total_queues: number;
  active_queues: number;
  queue_stats: QueueStatsResponse[];
}

export interface QueueStats {
  queue_id: string;
  queue_name: string;
  total_calls: number;
  answered_calls: number;
  abandoned_calls: number;
  average_wait_time_seconds: number;
  average_handle_time_seconds: number;
  service_level_percentage: number;
  active_agents: number;
  total_agents: number;
  calls_in_queue: number;
}

export interface AgentStats {
  user_id: string;
  user_name: string;
  total_calls: number;
  inbound_calls: number;
  outbound_calls: number;
  total_duration_seconds: number;
  average_handle_time_seconds: number;
  average_after_call_work_seconds: number;
  availability_percentage: number;
  calls_per_hour: number;
}

// ==================== Constants ====================

export const AGENT_STATUS_CONFIG: Record<
  AgentStatusEnum,
  { label: string; color: string; bgColor: string; dotColor: string; icon: string }
> = {
  [AgentStatusEnum.AVAILABLE]: {
    label: "Available",
    color: "text-green-700",
    bgColor: "bg-green-100",
    dotColor: "bg-green-500",
    icon: "🟢",
  },
  [AgentStatusEnum.BUSY]: {
    label: "Busy",
    color: "text-red-700",
    bgColor: "bg-red-100",
    dotColor: "bg-red-500",
    icon: "🔴",
  },
  [AgentStatusEnum.AFTER_CALL_WORK]: {
    label: "After Call Work",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    dotColor: "bg-yellow-500",
    icon: "🟡",
  },
  [AgentStatusEnum.UNAVAILABLE]: {
    label: "Unavailable",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    dotColor: "bg-gray-500",
    icon: "⚫",
  },
  [AgentStatusEnum.OFFLINE]: {
    label: "Offline",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    dotColor: "bg-gray-400",
    icon: "⚪",
  },
};

export const CALL_STATUS_CONFIG: Record<
  CallStatus,
  { label: string; color: string; bgColor: string }
> = {
  [CallStatus.QUEUED]: {
    label: "Queued",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
  [CallStatus.RINGING]: {
    label: "Ringing",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
  },
  [CallStatus.IN_PROGRESS]: {
    label: "In Progress",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  [CallStatus.COMPLETED]: {
    label: "Completed",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  [CallStatus.FAILED]: {
    label: "Failed",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  [CallStatus.MISSED]: {
    label: "Missed",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  [CallStatus.BUSY]: {
    label: "Busy",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  [CallStatus.NO_ANSWER]: {
    label: "No Answer",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  [CallStatus.VOICEMAIL]: {
    label: "Voicemail",
    color: "text-indigo-700",
    bgColor: "bg-indigo-100",
  },
};

export const CALLBACK_PRIORITY_CONFIG: Record<
  CallbackPriority,
  { label: string; color: string; bgColor: string }
> = {
  [CallbackPriority.LOW]: {
    label: "Low",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  [CallbackPriority.NORMAL]: {
    label: "Normal",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  [CallbackPriority.HIGH]: {
    label: "High",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  [CallbackPriority.URGENT]: {
    label: "Urgent",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

export const RING_STRATEGY_OPTIONS = [
  { value: RingStrategy.ROUND_ROBIN, label: "Round Robin" },
  { value: RingStrategy.LONGEST_IDLE, label: "Longest Idle" },
  { value: RingStrategy.RING_ALL, label: "Ring All" },
  { value: RingStrategy.RANDOM, label: "Random" },
];

export const OVERFLOW_ACTION_OPTIONS = [
  { value: OverflowAction.VOICEMAIL, label: "Go to Voicemail" },
  { value: OverflowAction.CALLBACK, label: "Offer Callback" },
  { value: OverflowAction.TRANSFER_QUEUE, label: "Transfer to Another Queue" },
];

// ==================== Helper Functions ====================

export function getAgentStatusLabel(status: AgentStatusEnum): string {
  return AGENT_STATUS_CONFIG[status]?.label || status;
}

export function getAgentStatusColors(status: AgentStatusEnum): {
  color: string;
  bgColor: string;
} {
  const config = AGENT_STATUS_CONFIG[status];
  return config
    ? { color: config.color, bgColor: config.bgColor }
    : { color: "text-gray-500", bgColor: "bg-gray-100" };
}

export function getCallStatusLabel(status: CallStatus): string {
  return CALL_STATUS_CONFIG[status]?.label || status;
}

export function getCallStatusColors(status: CallStatus): {
  color: string;
  bgColor: string;
} {
  const config = CALL_STATUS_CONFIG[status];
  return config
    ? { color: config.color, bgColor: config.bgColor }
    : { color: "text-gray-500", bgColor: "bg-gray-100" };
}

export function getCallbackPriorityLabel(priority: CallbackPriority): string {
  return CALLBACK_PRIORITY_CONFIG[priority]?.label || priority;
}

export function getCallbackPriorityColors(priority: CallbackPriority): {
  color: string;
  bgColor: string;
} {
  const config = CALLBACK_PRIORITY_CONFIG[priority];
  return config
    ? { color: config.color, bgColor: config.bgColor }
    : { color: "text-gray-500", bgColor: "bg-gray-100" };
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDurationLong(seconds: number): string {
  if (seconds < 0) return "0 seconds";
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

export function formatPhoneNumber(phone: string): string {
  // Simple formatting for display - can be enhanced
  if (phone.startsWith("+")) {
    // International format
    return phone;
  }
  return phone;
}
