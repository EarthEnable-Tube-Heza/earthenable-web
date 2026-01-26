/**
 * Entity Types
 *
 * TypeScript types matching backend Pydantic schemas for entities and entity access.
 */

/**
 * Entity response from API
 */
export interface Entity {
  id: string;
  name: string;
  code: string;
  country_code: string;
  currency: string;
  is_active: boolean;
  quickbooks_company_id?: string;
  quickbooks_realm_id?: string;
  quickbooks_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Entity list response for admin
 */
export interface EntityListResponse {
  id: string;
  name: string;
  code: string;
  is_parent: boolean;
  parent_id?: string;
  parent_name?: string;
  is_active: boolean;
  user_count: number; // Number of users with access
}

/**
 * User entity access response
 */
export interface EntityAccessResponse {
  id: string;
  user_id: string;
  entity_id: string;
  entity_name: string;
  entity_code: string;
  is_parent: boolean;
  granted_by_user_id?: string;
  granted_by_name?: string;
  granted_at: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User with their entity access information
 */
export interface UserWithEntityAccess {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: string;
  is_active: boolean;
  entity_access: EntityAccessResponse[];
  accessible_entity_count: number;
  default_entity_id?: string;
  default_entity_name?: string;
}

/**
 * Paginated response for users with entity access
 */
export interface PaginatedUserEntityAccessResponse {
  items: UserWithEntityAccess[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

/**
 * Grant entity access request
 */
export interface GrantEntityAccessRequest {
  entity_id: string;
  notes?: string;
}

/**
 * Bulk grant entity access request
 */
export interface BulkGrantEntityAccessRequest {
  entity_ids: string[];
  notes?: string;
}

/**
 * Revoke entity access request
 */
export interface RevokeEntityAccessRequest {
  entity_id: string;
}

// ============ Entity Sub-Resources ============

/**
 * Department response from API
 */
export interface DepartmentResponse {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  budget_limit?: number;
  is_active: boolean;
  gl_code?: string;
  gl_class_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Branch response from API
 */
export interface BranchResponse {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  location?: string;
  is_active: boolean;
  gl_code?: string;
  gl_class_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Job role response from API
 */
export interface JobRoleResponse {
  id: string;
  entity_id: string;
  name: string;
  code: string;
  level: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
