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
