/**
 * Permission Types
 *
 * TypeScript types for RBAC permission role management.
 */

// ============================================================================
// Granular Permission Role Types (Database-driven)
// ============================================================================

// Permission tree node for hierarchical display
export interface PermissionTreeNode {
  key: string;
  name: string;
  description: string;
  children: PermissionTreeNode[];
}

// Permission definitions response
export interface PermissionDefinitionsResponse {
  permissions: PermissionTreeNode[];
}

// Permission assignment with access level
export interface PermissionAssignment {
  id: string;
  permission_key: string;
  access_level: "full" | "read_only" | "none";
  created_at: string;
}

// Basic entity info for role responses
export interface EntityBasic {
  id: string;
  name: string;
  code: string;
}

// Permission role response
export interface PermissionRole {
  id: string;
  name: string;
  description?: string;
  entity_id?: string;
  entity?: EntityBasic;
  is_system_role: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Permission role with permissions detail
export interface PermissionRoleDetail extends PermissionRole {
  permissions: PermissionAssignment[];
  user_count: number;
}

// Permission role list response
export interface PermissionRoleListResponse {
  items: PermissionRole[];
  total: number;
}

// Create permission role request
export interface CreatePermissionRoleRequest {
  name: string;
  description?: string;
  entity_id?: string;
  permissions?: Array<{
    permission_key: string;
    access_level?: "full" | "read_only" | "none";
  }>;
}

// Update permission role request
export interface UpdatePermissionRoleRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Set role permissions request
export interface SetRolePermissionsRequest {
  permissions: Array<{
    permission_key: string;
    access_level: "full" | "read_only" | "none";
  }>;
}

// User permission role assignment
export interface UserPermissionRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  role: PermissionRole;
  entity_id?: string;
  entity?: EntityBasic;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
}

// User's roles response
export interface UserRolesResponse {
  user_id: string;
  roles: UserPermissionRoleAssignment[];
}

// Assign role to user request
export interface AssignRoleToUserRequest {
  role_id: string;
  entity_id?: string;
  expires_at?: string;
}

// Bulk assign role to users request
export interface BulkAssignRoleRequest {
  user_ids: string[];
  role_id: string;
  entity_id?: string;
  expires_at?: string;
}

// Bulk assign result item
export interface BulkAssignRoleResultItem {
  user_id: string;
  success: boolean;
  error?: string;
}

// Bulk assign role response
export interface BulkAssignRoleResponse {
  role_id: string;
  total: number;
  successful: number;
  failed: number;
  results: BulkAssignRoleResultItem[];
}

// User effective permissions response
export interface UserEffectivePermissionsResponse {
  user_id: string;
  permissions: Record<string, "full" | "read_only" | "none">;
}

// Enhanced permissions response from /auth/me/permissions
export interface EnhancedUserPermissionsResponse {
  permissions: string[];
  role: string;
  org_role?: string;
  permission_map?: Record<string, string>;
  has_custom_roles: boolean;
}
