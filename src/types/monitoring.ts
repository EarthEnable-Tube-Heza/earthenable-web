/**
 * Monitoring Types
 *
 * TypeScript types for the server monitoring dashboard.
 */

/**
 * Service health status
 */
export type ServiceStatusType = "healthy" | "degraded" | "unhealthy";

/**
 * Individual service status
 */
export interface ServiceStatus {
  name: string;
  status: ServiceStatusType;
  latency_ms: number | null;
  error: string | null;
  last_checked: string;
}

/**
 * Scheduler job information
 */
export interface SchedulerJob {
  id: string;
  name: string;
  next_run_time: string | null;
}

/**
 * Server health response from /admin/monitoring/health
 */
export interface ServerHealthResponse {
  overall_status: ServiceStatusType;
  api_version: string;
  uptime_seconds: number;
  services: ServiceStatus[];
  scheduler_running: boolean;
  scheduler_jobs: SchedulerJob[];
  timestamp: string;
}

/**
 * Sync history item
 */
export interface SyncHistoryItem {
  id: number;
  sync_session_id: string;
  sync_type: string;
  status: "pending" | "running" | "completed" | "failed";
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  total_records_synced: number;
  total_objects_synced: number;
  error_message: string | null;
}

/**
 * Salesforce sync status response from /admin/monitoring/salesforce-sync
 */
export interface SalesforceSyncStatusResponse {
  last_successful_sync: string | null;
  last_sync_status: string | null;
  last_sync_type: string | null;
  sync_interval_minutes: number;
  next_scheduled_sync: string | null;
  recent_syncs: SyncHistoryItem[];
  success_rate_24h: number;
  total_syncs_24h: number;
  failed_syncs_24h: number;
}

/**
 * Recent login item
 */
export interface RecentLogin {
  user_id: string;
  user_email: string;
  user_name: string | null;
  logged_in_at: string;
  device_type: string | null;
}

/**
 * User activity stats response from /admin/monitoring/user-activity
 */
export interface UserActivityStatsResponse {
  currently_online: number;
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  logins_24h: number;
  users_by_role: Record<string, number>;
  users_by_designation: Record<string, number>;
  recent_logins: RecentLogin[];
}

/**
 * Feature usage item
 */
export interface FeatureUsageItem {
  feature_name: string;
  usage_count: number;
  unique_users: number;
}

/**
 * Feature usage response from /admin/monitoring/feature-usage
 */
export interface FeatureUsageResponse {
  period_days: number;
  top_features: FeatureUsageItem[];
  total_activities: number;
}

/**
 * System resources response from /admin/monitoring/resources
 */
export interface SystemResourcesResponse {
  cpu_percent: number;
  memory_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  load_average: [number, number, number];
  timestamp: string;
}
