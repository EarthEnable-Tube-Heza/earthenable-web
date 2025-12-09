/**
 * Task Types
 *
 * TypeScript type definitions for task management.
 */

/**
 * Basic user info for task assignee display
 */
export interface TaskAssignee {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

/**
 * Basic supervisor/approver info
 */
export interface SupervisorBasic {
  id: string;
  name?: string;
  email: string;
}

/**
 * Enhanced assignee info with employee details
 */
export interface AssigneeDetail {
  // Basic user info
  id: string;
  email: string;
  name?: string;
  picture?: string;

  // Employee details
  job_title?: string;
  entity_name?: string;
  entity_code?: string;
  branch_name?: string;
  department_name?: string;
  sub_department_name?: string;
  level?: string;
  role?: string;
  employee_number?: string;

  // Supervisor/approver
  supervisor?: SupervisorBasic;
}

/**
 * Basic task subject info
 */
export interface TaskSubjectBasic {
  id: string;
  name: string;
}

/**
 * Basic account info for task list
 */
export interface TaskAccountBasic {
  id: string;
  name?: string;
}

/**
 * Task list item for paginated lists
 */
export interface TaskListItem {
  id: string;
  subject?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  type?: string;
  task_subtype?: string;
  number_of_times_called: number;
  short_comment?: string;

  // Related entities (basic info)
  employee_surveyor?: TaskAssignee;
  owner?: TaskAssignee;
  subject_ref?: TaskSubjectBasic;
  account?: TaskAccountBasic;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Detailed task information
 */
export interface TaskDetail extends TaskListItem {
  completed_at?: string;
  date_completion?: string;

  // IDs for related entities
  owner_id?: string;
  account_id?: string;
  contact_id?: string;
  opportunity_id?: string;
  employee_surveyor_id?: string;
  subject_id?: string;
}

/**
 * Paginated tasks response
 */
export interface PaginatedTasksResponse {
  items: TaskListItem[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

/**
 * Task statistics response
 */
export interface TaskStatsResponse {
  total_tasks: number;
  open_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  due_today: number;
  due_tomorrow: number;
  due_this_week: number;
  due_this_month: number;
  no_due_date: number;
  unassigned_tasks: number;
  recent_tasks: number;
  recently_completed: number;
  tasks_with_open_cases: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  by_subject: Record<string, number>;
}

/**
 * Request to update a task
 */
export interface UpdateTaskRequest {
  status?: string;
  priority?: string;
  employee_surveyor_id?: string;
  short_comment?: string;
}

/**
 * Request to reassign a task
 */
export interface ReassignTaskRequest {
  employee_surveyor_id: string;
}

/**
 * Request to bulk reassign tasks
 */
export interface BulkReassignTasksRequest {
  task_ids: string[];
  employee_surveyor_id: string;
}

/**
 * Bulk reassign response
 */
export interface BulkReassignResponse {
  message: string;
  updated_count: number;
}

/**
 * Format task status for display
 */
export function formatTaskStatus(status?: string): string {
  if (!status) return "Unknown";
  return status;
}

/**
 * Get status badge variant
 */
export function getStatusVariant(
  status?: string
): "success" | "warning" | "error" | "info" | "default" {
  if (!status) return "default";
  const lower = status.toLowerCase();

  if (lower.includes("completed")) return "success";
  if (lower.includes("in progress")) return "info";
  if (lower.includes("not started")) return "warning";
  if (lower.includes("not successfully")) return "error";

  return "default";
}

/**
 * Format priority for display
 */
export function formatPriority(priority?: string): string {
  if (!priority) return "Unknown";
  return priority;
}

/**
 * Get priority badge variant
 */
export function getPriorityVariant(
  priority?: string
): "success" | "warning" | "error" | "info" | "default" {
  if (!priority) return "default";
  const lower = priority.toLowerCase();

  if (lower === "high") return "error";
  if (lower === "normal") return "info";
  if (lower === "low") return "success";

  return "default";
}

/**
 * Due time filter options
 */
export type DueTimeFilter =
  | "all"
  | "overdue"
  | "due_today"
  | "due_tomorrow"
  | "due_this_week"
  | "due_this_month";

/**
 * Due date status for color coding
 */
export type DueDateStatus =
  | "overdue"
  | "due_today"
  | "due_tomorrow"
  | "due_this_week"
  | "due_later"
  | "no_date"
  | "completed";

/**
 * Get due date status relative to today
 * @param dueDate - The due date string
 * @param status - Optional task status to check if completed (completed tasks aren't overdue)
 */
export function getDueDateStatus(dueDate?: string, status?: string): DueDateStatus {
  // Check if task is completed first
  const isCompleted = status?.toLowerCase().includes("completed");
  if (isCompleted) return "completed";

  if (!dueDate) return "no_date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due_today";
  if (diffDays === 1) return "due_tomorrow";
  if (diffDays <= 7) return "due_this_week";
  return "due_later";
}

/**
 * Get color classes for due date status
 */
export function getDueDateColorClasses(status: DueDateStatus): string {
  switch (status) {
    case "overdue":
      return "text-status-error bg-status-error/10";
    case "due_today":
      return "text-primary bg-primary/10";
    case "due_tomorrow":
      return "text-status-warning bg-status-warning/10";
    case "due_this_week":
      return "text-status-info bg-status-info/10";
    case "due_later":
      return "text-status-info bg-status-info/10";
    case "completed":
      return "text-status-success bg-status-success/10";
    case "no_date":
    default:
      return "text-text-secondary bg-background-light";
  }
}

/**
 * Get due date label for display
 */
export function getDueDateLabel(status: DueDateStatus): string {
  switch (status) {
    case "overdue":
      return "Overdue";
    case "due_today":
      return "Due Today";
    case "due_tomorrow":
      return "Due Tomorrow";
    case "due_this_week":
      return "This Week";
    case "due_later":
      return "Later";
    case "completed":
      return "Completed";
    case "no_date":
    default:
      return "No Date";
  }
}

/**
 * Due time filter options with labels
 */
export const dueTimeFilterOptions: { value: DueTimeFilter; label: string }[] = [
  { value: "all", label: "All Tasks" },
  { value: "overdue", label: "Overdue" },
  { value: "due_today", label: "Due Today" },
  { value: "due_tomorrow", label: "Due Tomorrow" },
  { value: "due_this_week", label: "Due This Week" },
  { value: "due_this_month", label: "Due This Month" },
];

/**
 * Response for location filter values (cascading dropdowns)
 */
export interface LocationValuesResponse {
  countries: string[];
  districts: string[];
  sectors: string[];
  cells: string[];
  villages: string[];
}

// ============================================================================
// Complete Task Detail Types (for task detail modal/page)
// ============================================================================

/**
 * Contact information for task detail
 */
export interface ContactDetail {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  home_phone?: string;
  other_phone?: string;
  title?: string;
}

/**
 * Case information for task detail
 */
export interface CaseDetail {
  id: string;
  case_number?: string;
  subject?: string;
  status?: string;
  priority?: string;
  type?: string;
  is_closed: boolean;
  closed_date?: string;
  created_at: string;
}

/**
 * QA Survey information for task detail
 */
export interface QASurveyDetail {
  id: string;
  decision?: string;
  type?: string;
  subject?: string;
  evaluation_score?: number;
  evaluation_date?: string;
  due_date?: string;
  longitude?: number;
  latitude?: number;
  evaluator?: TaskAssignee;
}

/**
 * Project information for task detail
 */
export interface ProjectDetail {
  id: string;
  project_number?: string;
  start_date?: string;
  date_completed?: string;
  total_square_meters_epoxied?: number;
}

/**
 * Opportunity information for task detail
 */
export interface OpportunityDetail {
  id: string;
  name: string;
  stage?: string;
  amount?: number;
  close_date?: string;
  total_square_meters?: number;
  product_interest?: string;
  project_construction_status?: string;
  payment_status?: string;
  longitude?: number;
  latitude?: number;
  display_longitude?: number;
  display_latitude?: number;
  umudugudu_text?: string;
  umudugudu_district?: string;
  sector?: string;
  country?: string;
  mason_contact?: TaskAssignee;
  contact?: ContactDetail;
  project?: ProjectDetail;
  quality_assurance_surveys: QASurveyDetail[];
}

/**
 * Account information for task detail
 */
export interface AccountDetail {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  unique_account_id?: string;
  unique_customer_id?: string;
  umudugudu_text?: string;
  umudugudu_district?: string;
  umudugudu_country?: string;
  sector?: string;
  cell?: string;
  number_of_opportunities?: number;
  contacts: ContactDetail[];
  opportunities: OpportunityDetail[];
  cases: CaseDetail[];
}

/**
 * Task subject with form mappings
 */
export interface TaskSubjectDetail {
  id: string;
  name: string;
  description?: string;
}

/**
 * Complete task information with all related entities
 */
export interface TaskCompleteResponse extends TaskDetail {
  // Extended fields
  email?: string;
  phone?: string;
  call_duration?: number;
  call_disposition?: string;
  call_type?: string;

  // Enhanced assignee details (with employee info)
  employee_surveyor_detail?: AssigneeDetail;
  owner_detail?: AssigneeDetail;

  // Complete related entities
  account_detail?: AccountDetail;
  contact_detail?: ContactDetail;
  opportunity_detail?: OpportunityDetail;
  subject_detail?: TaskSubjectDetail;
}

/**
 * Get contact full name
 */
export function getContactFullName(contact?: ContactDetail): string {
  if (!contact) return "Unknown";
  const parts = [contact.first_name, contact.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Unknown";
}

/**
 * Get all phone numbers from a contact
 */
export function getContactPhones(contact?: ContactDetail): { label: string; number: string }[] {
  if (!contact) return [];
  const phones: { label: string; number: string }[] = [];
  if (contact.phone) phones.push({ label: "Phone", number: contact.phone });
  if (contact.mobile_phone) phones.push({ label: "Mobile", number: contact.mobile_phone });
  if (contact.home_phone) phones.push({ label: "Home", number: contact.home_phone });
  if (contact.other_phone) phones.push({ label: "Other", number: contact.other_phone });
  return phones;
}

/**
 * Format location from opportunity or account
 */
export function formatLocation(data?: {
  umudugudu_text?: string;
  sector?: string;
  umudugudu_district?: string;
  country?: string;
  cell?: string;
}): string {
  if (!data) return "-";
  const parts = [
    data.umudugudu_text,
    data.cell,
    data.sector,
    data.umudugudu_district,
    data.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "-";
}

/**
 * Get case status color classes
 */
export function getCaseStatusClasses(isOpen: boolean): string {
  return isOpen
    ? "text-status-warning bg-status-warning/10"
    : "text-status-success bg-status-success/10";
}

/**
 * Get QA decision color classes
 */
export function getQADecisionClasses(decision?: string): string {
  if (!decision) return "text-text-secondary bg-background-light";
  const lower = decision.toLowerCase();
  if (lower === "pass") return "text-status-success bg-status-success/10";
  if (lower === "fail") return "text-status-error bg-status-error/10";
  return "text-status-warning bg-status-warning/10";
}
