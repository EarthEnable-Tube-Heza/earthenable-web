/**
 * Permission Types
 *
 * TypeScript types for org hierarchy and permission management.
 */

// Org Hierarchy entry response
export interface OrgHierarchyEntry {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  department_id: string;
  department_name?: string;
  role: string;
  reports_to_user_id?: string;
  reports_to_name?: string;
  hierarchy_level: number;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
}

// Org Hierarchy list item for paginated responses
export interface OrgHierarchyListItem {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  department_id: string;
  department_name?: string;
  role: string;
  reports_to_user_id?: string;
  reports_to_name?: string;
  hierarchy_level: number;
  is_active: boolean;
}

// Paginated org hierarchy response
export interface PaginatedOrgHierarchyResponse {
  items: OrgHierarchyListItem[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

// Create org hierarchy request
export interface CreateOrgHierarchyRequest {
  user_id: string;
  department_id: string;
  role: string;
  reports_to_user_id?: string;
  hierarchy_level?: number;
  effective_from: string; // ISO date string (YYYY-MM-DD)
}

// Update org hierarchy request
export interface UpdateOrgHierarchyRequest {
  role?: string;
  reports_to_user_id?: string;
  hierarchy_level?: number;
  is_active?: boolean;
  effective_to?: string; // ISO date string (YYYY-MM-DD)
}

// Role option with permissions
export interface OrgRoleOption {
  value: string;
  label: string;
  expense_permissions: string[];
  task_permissions: string[];
}

// ============================================================================
// Role Permission Mapping Types
// ============================================================================

// Role permission mapping response
export interface RolePermissionMapping {
  id: string;
  salesforce_role: string;
  display_name: string;
  permission_tier: "view_own" | "view_team" | "view_all";
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// List response with total count
export interface RolePermissionMappingListResponse {
  mappings: RolePermissionMapping[];
  total: number;
}

// Create request
export interface CreateRolePermissionMappingRequest {
  salesforce_role: string;
  display_name: string;
  permission_tier: "view_own" | "view_team" | "view_all";
  description?: string;
}

// Update request
export interface UpdateRolePermissionMappingRequest {
  display_name?: string;
  permission_tier?: "view_own" | "view_team" | "view_all";
  description?: string;
  is_active?: boolean;
}

// Permission tier info
export interface PermissionTierInfo {
  tier: string;
  name: string;
  description: string;
  permissions: string[];
}

// Permission tiers response
export interface PermissionTiersResponse {
  tiers: PermissionTierInfo[];
}

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
