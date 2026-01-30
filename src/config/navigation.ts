/**
 * Navigation Configuration
 *
 * Defines the modular sidebar navigation structure organized by functional capabilities.
 * Each module groups related features, and visibility is controlled by permissions.
 *
 * Permission string format: module.action.scope
 * - module: The feature area (tasks, expense, users, etc.)
 * - action: What can be done (view, create, approve, manage, admin)
 * - scope: Data visibility (own, team, all) - optional for some actions
 */

import {
  Home,
  ClipboardList,
  ClipboardCheck,
  Phone,
  DollarSign,
  Users,
  BarChart3,
  Server,
  RefreshCw,
  Bell,
  MessageSquare,
  Settings,
  Palette,
  LayoutDashboard,
  FileText,
  UserCog,
  Activity,
  Shield,
} from "lucide-react";
import type { NavModule, NavigationConfig } from "../types/navigation";

/**
 * Permission constants for type safety and reusability
 *
 * These keys MUST match the backend permission definitions in:
 * earthenable-api/src/core/permission_definitions.py
 */
export const Permissions = {
  // Task permissions
  TASKS_VIEW_OWN: "tasks.view.own",
  TASKS_VIEW_TEAM: "tasks.view.team",
  TASKS_VIEW_ALL: "tasks.view.all",
  TASKS_MANAGE: "tasks.manage",

  // Expense permissions
  EXPENSE_VIEW_OWN: "expense.view.own",
  EXPENSE_VIEW_TEAM: "expense.view.team",
  EXPENSE_VIEW_ALL: "expense.view.all",
  EXPENSE_CREATE: "expense.create",
  EXPENSE_APPROVE: "expense.approve",

  // Call center permissions (match backend permission_definitions.py)
  CALL_CENTER: "call_center",
  CALL_CENTER_WORKSPACE: "call_center.workspace",
  CALL_CENTER_CALLS: "call_center.calls",
  CALL_CENTER_CALLS_VIEW: "call_center.calls.view",
  CALL_CENTER_CALLS_VIEW_ALL: "call_center.calls.view_all",
  CALL_CENTER_CALLS_MAKE: "call_center.calls.make",
  CALL_CENTER_CALLS_RECEIVE: "call_center.calls.receive",
  CALL_CENTER_RECORDINGS: "call_center.recordings",
  CALL_CENTER_CALLBACKS: "call_center.callbacks",
  CALL_CENTER_QUEUES: "call_center.queues",
  CALL_CENTER_AGENTS: "call_center.agents",
  CALL_CENTER_STATS: "call_center.stats",
  CALL_CENTER_SETTINGS: "call_center.settings",

  // User management permissions
  USERS_VIEW: "users.view",
  USERS_MANAGE: "users.manage",

  // Analytics permissions
  ANALYTICS_VIEW: "analytics.view",
  ANALYTICS_EXPORT: "analytics.export",

  // System administration permissions
  SYSTEM_ADMIN: "system.admin",
  SYSTEM_MONITORING: "system.monitoring",
  SYSTEM_SYNC: "system.sync",
  SYSTEM_NOTIFICATIONS: "system.notifications",
  SYSTEM_SMS: "system.sms",
} as const;

/**
 * Navigation modules organized by functional area
 */
export const navigationModules: NavModule[] = [
  // Dashboard - Always visible (minimal permissions)
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    modulePermissions: [], // Empty = always visible to authenticated users
    defaultExpanded: true,
    items: [
      {
        id: "home",
        label: "Home",
        href: "/dashboard",
        icon: Home,
        permissions: [], // Always visible
      },
    ],
  },

  // Quality Assurance - Task management and evaluations
  {
    id: "quality-assurance",
    label: "Quality Assurance",
    icon: ClipboardCheck,
    modulePermissions: [
      Permissions.TASKS_VIEW_OWN,
      Permissions.TASKS_VIEW_TEAM,
      Permissions.TASKS_VIEW_ALL,
    ],
    defaultExpanded: true,
    items: [
      {
        id: "tasks",
        label: "Tasks",
        href: "/dashboard/tasks",
        icon: ClipboardList,
        permissions: [
          Permissions.TASKS_VIEW_OWN,
          Permissions.TASKS_VIEW_TEAM,
          Permissions.TASKS_VIEW_ALL,
        ],
      },
    ],
  },

  // Call Center - Calls and messaging
  {
    id: "call-center",
    label: "Call Center",
    icon: Phone,
    modulePermissions: [
      Permissions.CALL_CENTER,
      Permissions.CALL_CENTER_WORKSPACE,
      Permissions.CALL_CENTER_CALLS,
      Permissions.CALL_CENTER_CALLS_VIEW,
      Permissions.SYSTEM_SMS,
    ],
    defaultExpanded: true,
    items: [
      {
        id: "calls",
        label: "Calls",
        href: "/dashboard/call-center",
        icon: Phone,
        permissions: [
          Permissions.CALL_CENTER,
          Permissions.CALL_CENTER_WORKSPACE,
          Permissions.CALL_CENTER_CALLS,
          Permissions.CALL_CENTER_CALLS_VIEW,
        ],
      },
      {
        id: "sms",
        label: "SMS",
        href: "/dashboard/sms",
        icon: MessageSquare,
        permissions: [Permissions.SYSTEM_SMS, Permissions.CALL_CENTER_SETTINGS],
      },
    ],
  },

  // Finance - Expense management
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    modulePermissions: [
      Permissions.EXPENSE_VIEW_OWN,
      Permissions.EXPENSE_VIEW_TEAM,
      Permissions.EXPENSE_VIEW_ALL,
      Permissions.EXPENSE_CREATE,
    ],
    defaultExpanded: true,
    items: [
      {
        id: "expenses",
        label: "Expenses",
        href: "/dashboard/expenses",
        icon: FileText,
        permissions: [
          Permissions.EXPENSE_VIEW_OWN,
          Permissions.EXPENSE_VIEW_TEAM,
          Permissions.EXPENSE_VIEW_ALL,
          Permissions.EXPENSE_CREATE,
        ],
      },
    ],
  },

  // People - User management
  {
    id: "people",
    label: "People",
    icon: Users,
    modulePermissions: [Permissions.USERS_VIEW, Permissions.USERS_MANAGE],
    defaultExpanded: false,
    items: [
      {
        id: "users",
        label: "User Management",
        href: "/dashboard/users",
        icon: UserCog,
        permissions: [Permissions.USERS_VIEW, Permissions.USERS_MANAGE],
      },
    ],
  },

  // Reports - Analytics and reporting
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    modulePermissions: [Permissions.ANALYTICS_VIEW],
    defaultExpanded: false,
    items: [
      {
        id: "analytics",
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: Activity,
        permissions: [Permissions.ANALYTICS_VIEW],
      },
    ],
  },

  // Administration - System admin only
  {
    id: "administration",
    label: "Administration",
    icon: Settings,
    modulePermissions: [Permissions.SYSTEM_ADMIN],
    defaultExpanded: false,
    items: [
      {
        id: "monitoring",
        label: "Monitoring",
        href: "/dashboard/monitoring",
        icon: Server,
        permissions: [Permissions.SYSTEM_MONITORING, Permissions.SYSTEM_ADMIN],
      },
      {
        id: "sync",
        label: "Sync",
        href: "/dashboard/sync",
        icon: RefreshCw,
        permissions: [Permissions.SYSTEM_SYNC, Permissions.SYSTEM_ADMIN],
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        permissions: [Permissions.SYSTEM_NOTIFICATIONS, Permissions.SYSTEM_ADMIN],
      },
      {
        id: "permissions",
        label: "Permissions",
        href: "/dashboard/permissions",
        icon: Shield,
        permissions: [Permissions.SYSTEM_ADMIN],
      },
      {
        id: "components",
        label: "Components",
        href: "/dashboard/components",
        icon: Palette,
        permissions: [Permissions.SYSTEM_ADMIN],
      },
    ],
  },
];

/**
 * Complete navigation configuration export
 */
export const navigationConfig: NavigationConfig = {
  modules: navigationModules,
};

/**
 * Role-to-permissions mapping
 * Maps user roles to the permissions they have
 * This is used as a fallback when the backend doesn't provide permissions
 */
export const rolePermissions: Record<string, string[]> = {
  admin: [
    // Admins have all permissions
    Permissions.TASKS_VIEW_ALL,
    Permissions.TASKS_MANAGE,
    Permissions.EXPENSE_VIEW_ALL,
    Permissions.EXPENSE_CREATE,
    Permissions.EXPENSE_APPROVE,
    Permissions.CALL_CENTER,
    Permissions.CALL_CENTER_WORKSPACE,
    Permissions.CALL_CENTER_CALLS,
    Permissions.CALL_CENTER_CALLS_VIEW,
    Permissions.CALL_CENTER_CALLS_VIEW_ALL,
    Permissions.CALL_CENTER_SETTINGS,
    Permissions.USERS_VIEW,
    Permissions.USERS_MANAGE,
    Permissions.ANALYTICS_VIEW,
    Permissions.ANALYTICS_EXPORT,
    Permissions.SYSTEM_ADMIN,
    Permissions.SYSTEM_MONITORING,
    Permissions.SYSTEM_SYNC,
    Permissions.SYSTEM_NOTIFICATIONS,
    Permissions.SYSTEM_SMS,
  ],
  manager: [
    // Managers can view team data and have some elevated permissions
    Permissions.TASKS_VIEW_TEAM,
    Permissions.TASKS_MANAGE,
    Permissions.EXPENSE_VIEW_TEAM,
    Permissions.EXPENSE_CREATE,
    Permissions.EXPENSE_APPROVE,
    Permissions.CALL_CENTER,
    Permissions.CALL_CENTER_WORKSPACE,
    Permissions.CALL_CENTER_CALLS,
    Permissions.CALL_CENTER_CALLS_VIEW,
    Permissions.CALL_CENTER_STATS,
    Permissions.USERS_VIEW,
    Permissions.ANALYTICS_VIEW,
  ],
  qa_agent: [
    // QA agents have basic permissions
    Permissions.TASKS_VIEW_OWN,
    Permissions.EXPENSE_VIEW_OWN,
    Permissions.EXPENSE_CREATE,
    Permissions.CALL_CENTER,
    Permissions.CALL_CENTER_WORKSPACE,
    Permissions.CALL_CENTER_CALLS_VIEW,
  ],
  // Default permissions for unknown roles
  default: [Permissions.EXPENSE_VIEW_OWN, Permissions.EXPENSE_CREATE],
};

/**
 * Get permissions for a given role
 */
export function getPermissionsForRole(role: string): string[] {
  return rolePermissions[role] || rolePermissions.default;
}

/**
 * Route-to-permissions mapping for middleware protection
 */
export const routePermissions: Record<string, string[]> = {
  "/dashboard/users": [Permissions.USERS_VIEW, Permissions.USERS_MANAGE],
  "/dashboard/tasks": [
    Permissions.TASKS_VIEW_OWN,
    Permissions.TASKS_VIEW_TEAM,
    Permissions.TASKS_VIEW_ALL,
  ],
  "/dashboard/analytics": [Permissions.ANALYTICS_VIEW],
  "/dashboard/monitoring": [Permissions.SYSTEM_MONITORING, Permissions.SYSTEM_ADMIN],
  "/dashboard/sync": [Permissions.SYSTEM_SYNC, Permissions.SYSTEM_ADMIN],
  "/dashboard/notifications": [Permissions.SYSTEM_NOTIFICATIONS, Permissions.SYSTEM_ADMIN],
  "/dashboard/sms": [Permissions.SYSTEM_SMS, Permissions.SYSTEM_ADMIN],
  "/dashboard/call-center": [
    Permissions.CALL_CENTER,
    Permissions.CALL_CENTER_WORKSPACE,
    Permissions.CALL_CENTER_CALLS,
    Permissions.CALL_CENTER_CALLS_VIEW,
  ],
  "/dashboard/components": [Permissions.SYSTEM_ADMIN],
  "/dashboard/expenses": [
    Permissions.EXPENSE_VIEW_OWN,
    Permissions.EXPENSE_VIEW_TEAM,
    Permissions.EXPENSE_VIEW_ALL,
    Permissions.EXPENSE_CREATE,
  ],
};
