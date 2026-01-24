/**
 * Navigation Types
 *
 * TypeScript types for the modular, permission-aware sidebar navigation.
 */

import type { LucideIcon } from "lucide-react";

/**
 * Permission string format: module.action.scope
 * Examples:
 * - "tasks.view.own" - View own tasks
 * - "tasks.view.team" - View team tasks
 * - "tasks.view.all" - View all tasks
 * - "expense.create" - Create expenses
 * - "expense.approve" - Approve expenses
 * - "users.manage" - Manage users
 * - "system.admin" - System administration
 */
export type Permission = string;

/**
 * Single navigation item within a module
 */
export interface NavItem {
  /** Unique identifier for the nav item */
  id: string;
  /** Display label */
  label: string;
  /** Route path */
  href: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Permissions required - user needs ANY of these to see the item */
  permissions?: Permission[];
  /** Optional badge content (e.g., notification count) */
  badge?: string | number;
  /** Whether this item is currently disabled */
  disabled?: boolean;
}

/**
 * Navigation module (group of related items)
 */
export interface NavModule {
  /** Unique identifier for the module */
  id: string;
  /** Display label for the module header */
  label: string;
  /** Lucide icon for the module */
  icon: LucideIcon;
  /** Permissions to show the entire module - user needs ANY of these */
  modulePermissions: Permission[];
  /** Navigation items within this module */
  items: NavItem[];
  /** Whether the module is expanded by default */
  defaultExpanded?: boolean;
}

/**
 * Complete navigation configuration
 */
export interface NavigationConfig {
  /** All navigation modules */
  modules: NavModule[];
}

/**
 * User permissions state from the backend
 */
export interface UserPermissions {
  /** Set of permission strings the user has */
  permissions: string[];
  /** User's role (admin, manager, qa_agent, etc.) */
  role: string;
  /** User's organizational role if applicable */
  orgRole?: string;
}

/**
 * Navigation state stored in localStorage
 */
export interface NavigationState {
  /** Map of module IDs to their expanded state */
  expandedModules: Record<string, boolean>;
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
}

/**
 * Props for NavGroup component
 */
export interface NavGroupProps {
  /** The navigation module to render */
  module: NavModule;
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
  /** Whether the group is expanded */
  isExpanded: boolean;
  /** Callback when expansion state changes */
  onToggleExpanded: (moduleId: string) => void;
  /** Current active pathname */
  pathname: string;
}

/**
 * Props for NavItem component
 */
export interface NavItemProps {
  /** The navigation item to render */
  item: NavItem;
  /** Whether the sidebar is collapsed */
  isCollapsed: boolean;
  /** Whether this item is currently active */
  isActive: boolean;
  /** Click handler */
  onClick?: () => void;
}
