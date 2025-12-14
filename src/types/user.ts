/**
 * User Types
 *
 * TypeScript types matching backend Pydantic schemas for users.
 * Roles are now dynamic strings from Salesforce (Staff_Position__c field).
 */

/**
 * Known user roles (for reference and special handling)
 * Note: Roles are dynamic strings, not a closed enum.
 */
export const KnownRoles = {
  ADMIN: "admin",
  MANAGER: "manager",
  QA_AGENT: "qa_agent",
  SYSTEM_USER: "system_user",
  PENDING_ASSIGNMENT: "pending_assignment",
} as const;

/**
 * User interface matching backend User model
 * Role is a dynamic string from Salesforce
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  google_id?: string;
  role: string; // Dynamic role string from Salesforce
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
  entity_id?: string;
}

/**
 * User list item for paginated lists (admin dashboard)
 */
export interface UserListItem {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: string; // Dynamic role string
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

/**
 * Detailed user information with related data counts
 */
export interface UserDetail extends UserListItem {
  google_id?: string;
  is_verified: boolean;
  tasks_count: number;
  cases_count: number;
  surveys_count?: number;
}

/**
 * Direct report (someone who reports to a user)
 */
export interface DirectReport {
  id: string;
  email: string;
  name?: string;
  role: string;
  department_name?: string;
}

/**
 * Employee detail information
 */
export interface EmployeeDetail {
  id: string;
  user_id: string;

  // Entity & Department
  entity_id: string;
  entity_name?: string;
  entity_code?: string;

  department_id?: string;
  department_name?: string;
  department_code?: string;

  sub_department_id?: string;
  sub_department_name?: string;

  branch_id?: string;
  branch_name?: string;
  branch_location?: string;

  // Job Role
  job_role_id?: string;
  job_role_name?: string;
  job_role_level?: string;

  // Employment Details
  role: string;
  level?: string;
  employee_number?: string;
  job_title?: string;

  // Dates
  start_date: string;
  end_date?: string;
  is_current: boolean;

  // Approver & Supervisor
  approver_id?: string;
  approver_name?: string;
  approver_email?: string;

  supervisor_id?: string;
  supervisor_name?: string;
  supervisor_email?: string;
  supervisor_role?: string;
  supervisor_department_name?: string;

  // Notes
  notes?: string;

  // Direct Reports
  direct_reports?: DirectReport[];

  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * User with full employee details
 */
export interface UserWithEmployeeDetail extends UserDetail {
  employee?: EmployeeDetail;
}

/**
 * User statistics response
 */
export interface UserStatsResponse {
  total_users: number;
  active_users: number;
  by_role: Record<string, number>;
  recent_signups: UserListItem[];
}

/**
 * Paginated users response
 */
export interface PaginatedUsersResponse {
  items: UserListItem[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Update user role request
 */
export interface UpdateUserRole {
  role: string; // Dynamic role string
}

/**
 * Update user status request
 */
export interface UpdateUserStatus {
  is_active: boolean;
}

/**
 * Format role string for display (convert snake_case to Title Case)
 */
export function formatRoleLabel(role: string | undefined | null): string {
  if (!role) return "Unknown";

  // Convert snake_case to Title Case
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === KnownRoles.ADMIN;
}

/**
 * Check if user has manager role or higher
 */
export function isManager(user: User | null | undefined): boolean {
  return user?.role === KnownRoles.MANAGER || user?.role === KnownRoles.ADMIN;
}

/**
 * Check if user has QA agent role or higher
 */
export function isQAAgent(user: User | null | undefined): boolean {
  return (
    user?.role === KnownRoles.QA_AGENT ||
    user?.role === KnownRoles.MANAGER ||
    user?.role === KnownRoles.ADMIN
  );
}

// ============ Backward compatibility exports ============
// Keep UserRole enum for any existing code that imports it
export enum UserRole {
  QA_AGENT = "qa_agent",
  MANAGER = "manager",
  ADMIN = "admin",
}

export const UserRoleLabels: Record<string, string> = {
  [UserRole.QA_AGENT]: "QA Agent",
  [UserRole.MANAGER]: "Manager",
  [UserRole.ADMIN]: "Admin",
};
