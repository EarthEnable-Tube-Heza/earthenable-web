"use client";

/**
 * Permission Hooks
 *
 * Custom React hooks for permission-based access control.
 * These hooks integrate with the navigation configuration and auth context
 * to provide granular permission checking throughout the application.
 *
 * Supports both database-driven permissions (via /auth/me/permissions API)
 * and fallback role-based permissions for backward compatibility.
 */

import { useMemo, useCallback, useState, useEffect } from "react";
import { useAuth } from "./hooks";
import { navigationModules, getPermissionsForRole, Permissions } from "../../config/navigation";
import type { Permission } from "../../types";
import { apiClient } from "../api";

/**
 * Local storage key for caching permissions
 */
const PERMISSIONS_CACHE_KEY = "earthenable_user_permissions";

/**
 * Cache duration for permissions (5 minutes)
 */
const PERMISSIONS_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Hook to manage user permissions
 *
 * Returns the current user's permissions as a Set for efficient lookups,
 * along with helper methods for checking permissions.
 *
 * Now fetches permissions from the backend API which supports:
 * - Database-driven permission roles (when user has custom roles assigned)
 * - Fallback to role-based permissions (backward compatibility)
 *
 * @example
 * const { permissions, hasPermission, hasAnyPermission } = usePermissions();
 * if (hasPermission('tasks.view.all')) { ... }
 * if (hasAnyPermission(['expense.approve', 'expense.view.team'])) { ... }
 */
export function usePermissions() {
  const { user, isLoading: authLoading } = useAuth();
  const [backendPermissions, setBackendPermissions] = useState<string[] | null>(null);
  const [permissionMap, setPermissionMap] = useState<Record<string, string> | null>(null);
  const [hasCustomRoles, setHasCustomRoles] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // Fetch permissions from backend when user changes
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.id) {
        setBackendPermissions(null);
        setPermissionMap(null);
        setHasCustomRoles(false);
        return;
      }

      // Check cache first
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (
              parsed.userId === user.id &&
              parsed.permissions &&
              parsed.timestamp &&
              Date.now() - parsed.timestamp < PERMISSIONS_CACHE_DURATION
            ) {
              setBackendPermissions(parsed.permissions);
              setPermissionMap(parsed.permissionMap || null);
              setHasCustomRoles(parsed.hasCustomRoles || false);
              return;
            }
          } catch {
            // Invalid cache, continue to fetch
          }
        }
      }

      // Fetch from API
      setIsLoadingPermissions(true);
      try {
        const response = await apiClient.getMyPermissions();
        setBackendPermissions(response.permissions);
        setPermissionMap(response.permission_map || null);
        setHasCustomRoles(response.has_custom_roles);

        // Cache the result
        if (typeof window !== "undefined") {
          localStorage.setItem(
            PERMISSIONS_CACHE_KEY,
            JSON.stringify({
              userId: user.id,
              permissions: response.permissions,
              permissionMap: response.permission_map,
              hasCustomRoles: response.has_custom_roles,
              timestamp: Date.now(),
            })
          );
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        // Fall back to role-based permissions
        setBackendPermissions(null);
        setPermissionMap(null);
        setHasCustomRoles(false);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [user?.id]);

  // Compute permissions from API response or role (fallback)
  const permissions = useMemo(() => {
    // If we have backend permissions, use those
    if (backendPermissions) {
      return new Set(backendPermissions);
    }

    // Otherwise, derive from role
    if (!user?.role) {
      return new Set<string>();
    }

    const rolePerms = getPermissionsForRole(user.role);
    return new Set(rolePerms);
  }, [user?.role, backendPermissions]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      // Superusers have all permissions
      if (user?.is_superuser) {
        return true;
      }
      return permissions.has(permission);
    },
    [permissions, user?.is_superuser]
  );

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissionList: Permission[]): boolean => {
      // Empty permission list = always allowed
      if (!permissionList || permissionList.length === 0) {
        return true;
      }

      // Superusers have all permissions
      if (user?.is_superuser) {
        return true;
      }

      return permissionList.some((p) => permissions.has(p));
    },
    [permissions, user?.is_superuser]
  );

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissionList: Permission[]): boolean => {
      // Empty permission list = always allowed
      if (!permissionList || permissionList.length === 0) {
        return true;
      }

      // Superusers have all permissions
      if (user?.is_superuser) {
        return true;
      }

      return permissionList.every((p) => permissions.has(p));
    },
    [permissions, user?.is_superuser]
  );

  /**
   * Update permissions from backend response
   * Call this after fetching permissions from the API
   */
  const setPermissionsFromBackend = useCallback(
    (perms: string[]) => {
      setBackendPermissions(perms);

      // Cache permissions
      if (typeof window !== "undefined" && user?.id) {
        localStorage.setItem(
          PERMISSIONS_CACHE_KEY,
          JSON.stringify({
            userId: user.id,
            permissions: perms,
            timestamp: Date.now(),
          })
        );
      }
    },
    [user?.id]
  );

  /**
   * Clear cached permissions (e.g., on logout)
   */
  const clearPermissions = useCallback(() => {
    setBackendPermissions(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(PERMISSIONS_CACHE_KEY);
    }
  }, []);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: authLoading || isLoadingPermissions,
    setPermissionsFromBackend,
    clearPermissions,
    // Expose the Permissions constants for convenience
    Permissions,
    // Database-driven permission info
    permissionMap,
    hasCustomRoles,
    // Refresh permissions from API
    refreshPermissions: async () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(PERMISSIONS_CACHE_KEY);
      }
      setBackendPermissions(null);
      setPermissionMap(null);
      setHasCustomRoles(false);
    },
  };
}

/**
 * Hook to get filtered navigation based on user permissions
 *
 * Returns only the modules and items the current user has access to.
 *
 * @example
 * const { modules, isLoading } = useFilteredNavigation();
 */
export function useFilteredNavigation() {
  const { hasAnyPermission, isLoading } = usePermissions();

  const modules = useMemo(() => {
    return (
      navigationModules
        .filter((module) => {
          // Show module if user has ANY of its required permissions
          // Empty permissions array = always visible
          return hasAnyPermission(module.modulePermissions);
        })
        .map((module) => ({
          ...module,
          items: module.items.filter((item) => {
            // Show item if user has ANY of its required permissions
            // Empty or undefined permissions = always visible
            return hasAnyPermission(item.permissions || []);
          }),
        }))
        // Remove modules that have no visible items
        .filter((module) => module.items.length > 0)
    );
  }, [hasAnyPermission]);

  return {
    modules,
    isLoading,
  };
}

/**
 * Hook to check if user has access to a specific module
 *
 * @example
 * const hasAccess = useModuleAccess('administration');
 */
export function useModuleAccess(moduleId: string): boolean {
  const { hasAnyPermission } = usePermissions();

  const navModule = navigationModules.find((m) => m.id === moduleId);
  if (!navModule) {
    return false;
  }

  return hasAnyPermission(navModule.modulePermissions);
}

/**
 * Hook to check if user has access to a specific nav item
 *
 * @example
 * const hasAccess = useNavItemAccess('tasks');
 */
export function useNavItemAccess(itemId: string): boolean {
  const { hasAnyPermission } = usePermissions();

  for (const navModule of navigationModules) {
    const item = navModule.items.find((i) => i.id === itemId);
    if (item) {
      return hasAnyPermission(item.permissions || []);
    }
  }

  return false;
}

/**
 * Hook to require specific permissions - redirects if not authorized
 *
 * @param requiredPermissions - Permissions required (user needs ANY)
 * @param redirectPath - Path to redirect to if unauthorized (default: /dashboard)
 *
 * @example
 * useRequirePermissions(['users.manage', 'users.view']);
 */
export function useRequirePermissions(
  requiredPermissions: Permission[],
  redirectPath: string = "/dashboard"
) {
  const { hasAnyPermission, isLoading } = usePermissions();
  const { user } = useAuth();

  useEffect(() => {
    if (!isLoading && user && !hasAnyPermission(requiredPermissions)) {
      // Use window.location for redirect to avoid Next.js router issues
      if (typeof window !== "undefined") {
        window.location.href = redirectPath;
      }
    }
  }, [hasAnyPermission, isLoading, user, requiredPermissions, redirectPath]);

  return {
    isAuthorized: hasAnyPermission(requiredPermissions),
    isLoading,
  };
}

/**
 * Hook to check permission tier level
 * Returns the highest permission tier the user has for a given feature module
 *
 * @example
 * const tier = usePermissionTier('tasks'); // 'all', 'team', 'own', or null
 */
export function usePermissionTier(
  featureModule: "tasks" | "expense"
): "all" | "team" | "own" | null {
  const { hasPermission } = usePermissions();

  if (featureModule === "tasks") {
    if (hasPermission(Permissions.TASKS_VIEW_ALL)) return "all";
    if (hasPermission(Permissions.TASKS_VIEW_TEAM)) return "team";
    if (hasPermission(Permissions.TASKS_VIEW_OWN)) return "own";
    return null;
  }

  if (featureModule === "expense") {
    if (hasPermission(Permissions.EXPENSE_VIEW_ALL)) return "all";
    if (hasPermission(Permissions.EXPENSE_VIEW_TEAM)) return "team";
    if (hasPermission(Permissions.EXPENSE_VIEW_OWN)) return "own";
    return null;
  }

  return null;
}

/**
 * Type-safe permission check hook for specific permission areas
 */
export function useTaskPermissions() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  return {
    canViewOwn: hasAnyPermission([
      Permissions.TASKS_VIEW_OWN,
      Permissions.TASKS_VIEW_TEAM,
      Permissions.TASKS_VIEW_ALL,
    ]),
    canViewTeam: hasAnyPermission([Permissions.TASKS_VIEW_TEAM, Permissions.TASKS_VIEW_ALL]),
    canViewAll: hasPermission(Permissions.TASKS_VIEW_ALL),
    canManage: hasPermission(Permissions.TASKS_MANAGE),
  };
}

export function useExpensePermissions() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  return {
    canViewOwn: hasAnyPermission([
      Permissions.EXPENSE_VIEW_OWN,
      Permissions.EXPENSE_VIEW_TEAM,
      Permissions.EXPENSE_VIEW_ALL,
    ]),
    canViewTeam: hasAnyPermission([Permissions.EXPENSE_VIEW_TEAM, Permissions.EXPENSE_VIEW_ALL]),
    canViewAll: hasPermission(Permissions.EXPENSE_VIEW_ALL),
    canCreate: hasPermission(Permissions.EXPENSE_CREATE),
    canApprove: hasPermission(Permissions.EXPENSE_APPROVE),
    canManage: hasPermission(Permissions.EXPENSE_MANAGE),
  };
}

export function useUserManagementPermissions() {
  const { hasPermission, hasAnyPermission } = usePermissions();

  return {
    canView: hasAnyPermission([Permissions.USERS_VIEW, Permissions.USERS_MANAGE]),
    canManage: hasPermission(Permissions.USERS_MANAGE),
  };
}

export function useSystemPermissions() {
  const { hasPermission } = usePermissions();

  return {
    isAdmin: hasPermission(Permissions.SYSTEM_ADMIN),
    canMonitor: hasPermission(Permissions.SYSTEM_MONITORING),
    canSync: hasPermission(Permissions.SYSTEM_SYNC),
    canManageNotifications: hasPermission(Permissions.SYSTEM_NOTIFICATIONS),
    canManageSms: hasPermission(Permissions.SYSTEM_SMS),
  };
}
