/**
 * Sync Types
 *
 * TypeScript interfaces for Salesforce and User sync data.
 */

// ============================================================================
// Salesforce Sync Types
// ============================================================================

/**
 * Individual sync result for an object type within a sync session.
 */
export interface SyncResultDetail {
  id: number;
  object_type: string;
  sync_stage: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  records_fetched: number;
  records_saved: number;
  records_updated: number;
  records_failed: number;
  api_calls_count: number;
  error_message: string | null;
}

/**
 * Detailed Salesforce sync session with results.
 */
export interface SalesforceSyncDetail {
  id: number;
  sync_session_id: string;
  sync_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  triggered_by: string | null;
  total_objects_synced: number;
  total_records_fetched: number;
  total_records_saved: number;
  total_api_calls: number;
  error_message: string | null;
  results: SyncResultDetail[];
}

/**
 * Paginated Salesforce sync history response.
 */
export interface SalesforceSyncHistoryResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  syncs: SalesforceSyncDetail[];
}

/**
 * Sync object statistics.
 */
export interface SyncObjectStats {
  object_type: string;
  total_fetched: number;
  total_saved: number;
  total_updated: number;
  avg_duration_seconds: number;
  sync_count: number;
}

/**
 * Aggregated Salesforce sync statistics.
 */
export interface SalesforceSyncStatsResponse {
  period_days: number;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  success_rate: number;
  total_records_synced: number;
  total_api_calls: number;
  avg_duration_seconds: number | null;
  min_duration_seconds: number | null;
  max_duration_seconds: number | null;
  object_stats: SyncObjectStats[];
  syncs_by_type: Record<string, number>;
  syncs_by_status: Record<string, number>;
}

// ============================================================================
// User Sync Types
// ============================================================================

/**
 * Detailed user sync session.
 */
export interface UserSyncSessionDetail {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  started_at: string;
  completed_at: string | null;
  sync_type: string;
  since_timestamp_used: string | null;
  tasks_returned_count: number;
  tasks_new_count: number | null;
  tasks_updated_count: number | null;
  tasks_deleted_count: number | null;
  tasks_completed_count: number | null;
  has_more: boolean;
  client_app_version: string | null;
  client_platform: string | null;
  client_device_info: string | null;
  success: boolean;
  error_message: string | null;
}

/**
 * Paginated user sync sessions response.
 */
export interface UserSyncSessionsResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  sessions: UserSyncSessionDetail[];
}

/**
 * User sync state details.
 */
export interface UserSyncStateDetail {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  user_role: string | null;
  installation_id: string | null;
  last_sync_timestamp: string | null;
  total_syncs: number;
  total_tasks_synced: number;
  last_full_sync_at: string | null;
  last_incremental_sync_at: string | null;
  force_full_sync: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated user sync states response.
 */
export interface UserSyncStatesResponse {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  states: UserSyncStateDetail[];
}

/**
 * Aggregated user sync statistics.
 */
export interface UserSyncStatsResponse {
  period_days: number;
  total_sync_sessions: number;
  successful_sessions: number;
  failed_sessions: number;
  success_rate: number;
  total_tasks_synced: number;
  unique_users: number;
  avg_tasks_per_sync: number;
  syncs_by_type: Record<string, number>;
  syncs_by_platform: Record<string, number>;
  active_installations: number;
  users_needing_full_sync: number;
}
