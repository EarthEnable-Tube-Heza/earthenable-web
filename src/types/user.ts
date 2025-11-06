/**
 * User Types
 *
 * TypeScript types matching backend Pydantic schemas for users.
 */

/**
 * User roles enum matching backend UserRole
 */
export enum UserRole {
  QA_AGENT = 'qa_agent',
  MANAGER = 'manager',
  ADMIN = 'admin',
}

/**
 * User interface matching backend User model
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  google_id?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

/**
 * User list item for paginated lists (admin dashboard)
 */
export interface UserListItem {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

/**
 * Detailed user information with related data counts
 */
export interface UserDetail extends UserListItem {
  google_id?: string;
  picture?: string;
  is_verified: boolean;
  tasks_count: number;
  cases_count: number;
  surveys_count?: number;
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
  role: UserRole;
}

/**
 * Update user status request
 */
export interface UpdateUserStatus {
  is_active: boolean;
}

/**
 * User role display names
 */
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.QA_AGENT]: 'QA Agent',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.ADMIN]: 'Admin',
};

/**
 * Check if user has admin role
 */
export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Check if user has manager role or higher
 */
export function isManager(user: User | null | undefined): boolean {
  return user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
}

/**
 * Check if user has QA agent role or higher
 */
export function isQAAgent(user: User | null | undefined): boolean {
  return (
    user?.role === UserRole.QA_AGENT ||
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.ADMIN
  );
}
