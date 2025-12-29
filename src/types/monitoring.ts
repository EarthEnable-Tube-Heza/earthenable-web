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

/**
 * Endpoint usage item
 */
export interface EndpointUsageItem {
  endpoint: string;
  endpoint_name: string | null;
  method: string;
  request_count: number;
  unique_users: number;
  avg_response_time_ms: number;
  error_count: number;
  error_rate: number;
}

/**
 * Endpoint usage response from /admin/monitoring/endpoint-usage
 */
export interface EndpointUsageResponse {
  period_days: number;
  total_requests: number;
  total_errors: number;
  overall_error_rate: number;
  endpoints: EndpointUsageItem[];
}

/**
 * Action usage within a screen
 */
export interface ActionUsage {
  action: string;
  usage_count: number;
  unique_users: number;
}

/**
 * Screen usage within a category
 */
export interface ScreenUsage {
  screen: string;
  display_name: string;
  total_usage: number;
  unique_users: number;
  actions: ActionUsage[];
}

/**
 * Category usage statistics
 */
export interface CategoryUsage {
  category: string;
  display_name: string;
  icon: string;
  color: string;
  total_usage: number;
  unique_users: number;
  screens: ScreenUsage[];
}

/**
 * Hierarchical feature usage response from /admin/monitoring/feature-usage/hierarchical
 */
export interface HierarchicalFeatureUsageResponse {
  period_days: number;
  total_activities: number;
  categories: CategoryUsage[];
}

/**
 * Activity timeline item
 */
export interface ActivityTimelineItem {
  id: number;
  event_name: string;
  event_type: string;
  category: string | null;
  screen: string | null;
  feature_name: string | null;
  metadata: Record<string, unknown> | null;
  occurred_at: string;
}

/**
 * Paginated activity response from /admin/monitoring/users/{id}/activity
 */
export interface PaginatedActivityResponse {
  items: ActivityTimelineItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * User who used a specific feature
 */
export interface FeatureUsersItem {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  usage_count: number;
  last_used: string;
}

/**
 * Response for users who used a specific feature
 */
export interface FeatureUsersResponse {
  feature: string;
  period_days: number;
  total_users: number;
  users: FeatureUsersItem[];
}

/**
 * OS version distribution item
 */
export interface OSVersionDistribution {
  os_name: string; // Android, iOS
  os_version: string; // e.g., "14", "7.0"
  display_name: string; // e.g., "Android 14", "iOS 17"
  session_count: number;
  unique_users: number;
  percentage: number;
}

/**
 * Device type (platform) distribution item
 */
export interface DeviceTypeDistribution {
  device_type: string; // android, ios
  session_count: number;
  unique_users: number;
  percentage: number;
}

/**
 * Device model distribution item
 */
export interface DeviceModelDistribution {
  device_model: string;
  device_type: string | null;
  session_count: number;
  unique_users: number;
  percentage: number;
}

/**
 * App version adoption item
 */
export interface AppVersionDistribution {
  app_version: string;
  build_number: string | null;
  display_version: string; // Combined display e.g., "1.0.0 (8)" or just "1.0.0"
  session_count: number;
  unique_users: number;
  percentage: number;
  is_latest: boolean;
}

/**
 * Platform analytics response from /admin/monitoring/platform-analytics
 */
export interface PlatformAnalyticsResponse {
  period_days: number;
  total_sessions: number;
  total_unique_users: number;
  device_types: DeviceTypeDistribution[];
  os_versions: OSVersionDistribution[];
  device_models: DeviceModelDistribution[];
  app_versions: AppVersionDistribution[];
}

/**
 * User who has actively used the app
 */
export interface ActiveAppUser {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  last_login: string;
}

/**
 * Response for users who have actively used the app
 */
export interface ActiveAppUsersResponse {
  total: number;
  users: ActiveAppUser[];
}

/**
 * Daily activity statistics for time series charts
 */
export interface DailyActivityStats {
  date: string; // ISO date string (YYYY-MM-DD)
  sessions: number; // Number of session starts
  unique_users: number; // Unique users who were active
  actions: number; // Total user actions/activities
}

/**
 * Response for activity time series data
 */
export interface ActivityTimeSeriesResponse {
  period_days: number;
  data: DailyActivityStats[];
  totals: {
    sessions: number;
    unique_users: number;
    actions: number;
  };
}

/**
 * User login frequency statistics
 */
export interface UserLoginFrequency {
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  role: string | null;
  total_sessions: number;
  sessions_in_period: number;
  first_login: string | null;
  last_login: string | null;
  avg_sessions_per_day: number;
  avg_gap_hours: number | null;
  last_device: string | null;
  last_app_version: string | null;
}

/**
 * Response for user login frequency statistics
 */
export interface UserLoginFrequencyResponse {
  period_days: number;
  period_label: string;
  total_users: number;
  total_sessions: number;
  users: UserLoginFrequency[];
}
