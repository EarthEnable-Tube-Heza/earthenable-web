"use client";

/**
 * PermissionGate Component
 *
 * Wraps protected content and only renders children if the user has
 * the required permissions. Supports both "any" and "all" permission modes.
 *
 * @example
 * // Show if user has any of these permissions
 * <PermissionGate permissions={["expense.approve", "expense.manage"]}>
 *   <ApproveButton />
 * </PermissionGate>
 *
 * @example
 * // Show if user has ALL of these permissions
 * <PermissionGate permissions={["users.view", "users.manage"]} mode="all">
 *   <UserManagement />
 * </PermissionGate>
 *
 * @example
 * // Show fallback when unauthorized
 * <PermissionGate
 *   permissions={["system.admin"]}
 *   fallback={<UnauthorizedMessage />}
 * >
 *   <AdminPanel />
 * </PermissionGate>
 */

import { type ReactNode } from "react";
import { usePermissions } from "@/src/lib/auth";
import type { Permission } from "@/src/types";

interface PermissionGateProps {
  /** Required permissions to show children */
  permissions: Permission[];
  /** Whether user needs "any" permission or "all" permissions (default: "any") */
  mode?: "any" | "all";
  /** Content to show if user has permission */
  children: ReactNode;
  /** Content to show if user doesn't have permission (default: null) */
  fallback?: ReactNode;
  /** Whether to show loading state while checking permissions */
  showLoading?: boolean;
}

export function PermissionGate({
  permissions,
  mode = "any",
  children,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  // Show loading state if requested
  if (isLoading && showLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-background-light rounded" />
      </div>
    );
  }

  // Don't render during loading by default
  if (isLoading) {
    return null;
  }

  // Check permissions based on mode
  const hasPermission =
    mode === "all" ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

  // Render children or fallback based on permission check
  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Convenience component for admin-only content
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permissions={["system.admin"]} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

/**
 * Convenience component for manager-and-above content
 */
export function ManagerOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate
      permissions={["system.admin", "tasks.manage", "expense.approve", "users.view"]}
      fallback={fallback}
    >
      {children}
    </PermissionGate>
  );
}
