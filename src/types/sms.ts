/**
 * SMS Types
 *
 * TypeScript types for SMS management.
 */

// ==================== SMS Settings ====================

export interface SmsSettings {
  id: string;
  entity_id: string;
  provider: string;
  api_username?: string;
  sender_id?: string;
  short_code?: string;
  is_enabled: boolean;
  use_sandbox: boolean;
  daily_limit: number;
  monthly_limit: number;
  daily_sent: number;
  monthly_sent: number;
  cost_per_sms: number;
  currency: string;
  total_spent_today: number;
  total_spent_month: number;
  budget_alert_threshold: number;
  is_configured: boolean;
  daily_remaining: number;
  monthly_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface SmsSettingsCreate {
  entity_id: string;
  provider?: string;
  api_key?: string;
  api_username?: string;
  sender_id?: string;
  short_code?: string;
  is_enabled?: boolean;
  use_sandbox?: boolean;
  daily_limit?: number;
  monthly_limit?: number;
  cost_per_sms?: number;
  currency?: string;
  budget_alert_threshold?: number;
}

export interface SmsSettingsUpdate {
  api_key?: string;
  api_username?: string;
  sender_id?: string;
  short_code?: string;
  is_enabled?: boolean;
  use_sandbox?: boolean;
  daily_limit?: number;
  monthly_limit?: number;
  cost_per_sms?: number;
  currency?: string;
  budget_alert_threshold?: number;
}

// ==================== SMS Templates ====================

export interface SmsTemplate {
  id: string;
  entity_id: string;
  code: string;
  language: string;
  name: string;
  description?: string;
  template_body: string;
  variables: string[];
  category?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SmsTemplateCreate {
  entity_id: string;
  code: string;
  language: string;
  name: string;
  description?: string;
  template_body: string;
  variables: string[];
  category?: string;
  is_active?: boolean;
}

export interface SmsTemplateUpdate {
  name?: string;
  description?: string;
  template_body?: string;
  variables?: string[];
  category?: string;
  is_active?: boolean;
}

export interface SmsTemplatePreviewRequest {
  variables: Record<string, string | number>;
}

export interface SmsTemplatePreviewResponse {
  rendered_message: string;
  character_count: number;
  segment_count: number;
  encoding: string;
}

// ==================== SMS Logs ====================

export interface SmsLog {
  id: string;
  entity_id: string;
  recipient_phone: string;
  recipient_name?: string;
  recipient_type?: string;
  template_code?: string;
  message_body: string;
  character_count: number;
  segment_count: number;
  encoding: string;
  provider: string;
  provider_message_id?: string;
  status: string;
  failure_reason?: string;
  cost?: number;
  currency?: string;
  context_type?: string;
  context_id?: string;
  created_at: string;
  sent_at?: string;
}

export interface PaginatedSmsLogsResponse {
  items: SmsLog[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface SmsLogsFilters {
  entity_id?: string;
  status?: string;
  template_code?: string;
  context_type?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

// ==================== Send SMS ====================

export interface SendSmsRequest {
  entity_id: string;
  phone: string;
  template_code?: string;
  message?: string;
  variables?: Record<string, string | number>;
  language?: string;
  recipient_name?: string;
  recipient_type?: string;
  recipient_id?: string;
  context_type?: string;
  context_id?: string;
}

export interface SendSmsResponse {
  success: boolean;
  message: string;
  message_id?: string;
  status: string;
  cost?: number;
  currency?: string;
  log_id?: string;
}

export interface SendBulkSmsRequest {
  entity_id: string;
  template_code: string;
  recipients: Array<{
    phone: string;
    name?: string;
    type?: string;
    id?: string;
    variables?: Record<string, string | number>;
  }>;
  common_variables?: Record<string, string | number>;
  language?: string;
  context_type?: string;
  context_id?: string;
}

export interface SendBulkSmsResponse {
  success: boolean;
  message: string;
  total_recipients: number;
  successful_count: number;
  failed_count: number;
  total_cost?: number;
  currency?: string;
}

// ==================== SMS Stats ====================

export interface SmsStats {
  period_days: number;
  total_sent: number;
  delivered: number;
  failed: number;
  delivery_rate: number;
  total_cost: number;
  currency: string;
  daily_remaining: number;
  monthly_remaining: number;
}

// ==================== Test SMS ====================

export interface TestSmsRequest {
  phone: string;
  message?: string;
}

export interface TestSmsResponse {
  success: boolean;
  message: string;
  message_id?: string;
  provider_response?: Record<string, unknown>;
}

// ==================== Template Filters ====================

export interface SmsTemplateFilters {
  entity_id?: string;
  code?: string;
  language?: string;
  category?: string;
  is_active?: boolean;
}

// ==================== Constants ====================

export const SMS_STATUS = {
  PENDING: "pending",
  QUEUED: "queued",
  SENT: "sent",
  DELIVERED: "delivered",
  FAILED: "failed",
  REJECTED: "rejected",
} as const;

export const SMS_TEMPLATE_CODES = {
  PROJECT_PROGRESS: "project_progress",
  PAYMENT_RECEIPT: "payment_receipt",
  MASON_EVALUATION_PASS: "mason_evaluation_pass",
  MASON_EVALUATION_FAIL: "mason_evaluation_fail",
} as const;

export const SMS_TEMPLATE_CATEGORIES = {
  CUSTOMER: "customer",
  MASON: "mason",
  EMPLOYEE: "employee",
  ADMIN: "admin",
} as const;

export const SMS_LANGUAGES = {
  ENGLISH: "en",
  KINYARWANDA: "rw",
  SWAHILI: "sw",
} as const;

// Helper functions
export function getSmsStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    queued: "Queued",
    sent: "Sent",
    delivered: "Delivered",
    failed: "Failed",
    rejected: "Rejected",
  };
  return labels[status] || status;
}

export function getSmsStatusColors(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    queued: { bg: "bg-blue-100", text: "text-blue-800" },
    sent: { bg: "bg-cyan-100", text: "text-cyan-800" },
    delivered: { bg: "bg-green-100", text: "text-green-800" },
    failed: { bg: "bg-red-100", text: "text-red-800" },
    rejected: { bg: "bg-orange-100", text: "text-orange-800" },
  };
  return colors[status] || { bg: "bg-gray-100", text: "text-gray-800" };
}

export function getLanguageLabel(code: string): string {
  const labels: Record<string, string> = {
    en: "English",
    rw: "Kinyarwanda",
    sw: "Swahili",
  };
  return labels[code] || code.toUpperCase();
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    customer: "Customer",
    mason: "Mason",
    employee: "Employee",
    admin: "Admin",
  };
  return labels[category] || category;
}
