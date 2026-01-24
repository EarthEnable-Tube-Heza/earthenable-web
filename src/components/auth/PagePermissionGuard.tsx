"use client";

/**
 * PagePermissionGuard Component
 *
 * Page-level protection component that:
 * 1. Checks if user has required permissions
 * 2. Shows loading state while checking
 * 3. Redirects to dashboard if unauthorized
 * 4. Renders page content if authorized
 *
 * @example
 * // In a page component
 * export default function AdminSettingsPage() {
 *   return (
 *     <PagePermissionGuard
 *       permissions={["system.admin"]}
 *       pageTitle="Admin Settings"
 *     >
 *       <AdminSettingsContent />
 *     </PagePermissionGuard>
 *   );
 * }
 */

import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions, useAuth } from "@/src/lib/auth";
import { Spinner } from "@/src/components/ui";
import { AlertCircle, Lock } from "@/src/components/icons";
import type { Permission } from "@/src/types";

interface PagePermissionGuardProps {
  /** Required permissions to access this page (user needs ANY) */
  permissions: Permission[];
  /** Page title for error messages */
  pageTitle?: string;
  /** Page content to render if authorized */
  children: ReactNode;
  /** Path to redirect to if unauthorized (default: /dashboard) */
  redirectPath?: string;
  /** Whether to show an error page instead of redirecting */
  showUnauthorizedPage?: boolean;
}

export function PagePermissionGuard({
  permissions,
  pageTitle = "this page",
  children,
  redirectPath = "/dashboard",
  showUnauthorizedPage = false,
}: PagePermissionGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasAnyPermission, isLoading: permLoading } = usePermissions();

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const isLoading = authLoading || permLoading;

  // Check authorization
  useEffect(() => {
    if (!isLoading) {
      // Empty permissions array = page accessible to all authenticated users
      if (permissions.length === 0) {
        setIsAuthorized(true);
        return;
      }

      const authorized = hasAnyPermission(permissions);
      setIsAuthorized(authorized);

      // Redirect if not authorized and not showing error page
      if (!authorized && !showUnauthorizedPage) {
        router.replace(redirectPath);
      }
    }
  }, [isLoading, hasAnyPermission, permissions, router, redirectPath, showUnauthorizedPage]);

  // Loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-muted">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect handled by middleware
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-muted">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Unauthorized - show error page if configured
  if (!isAuthorized && showUnauthorizedPage) {
    return <UnauthorizedPage pageTitle={pageTitle} />;
  }

  // Unauthorized - this shouldn't render as we redirect in useEffect
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Authorized - render children
  return <>{children}</>;
}

/**
 * Unauthorized page component
 */
function UnauthorizedPage({ pageTitle }: { pageTitle: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-error" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-2">Access Denied</h1>

          {/* Message */}
          <p className="text-text-muted mb-6">
            You don&apos;t have permission to access {pageTitle}. If you believe this is an error,
            please contact your administrator.
          </p>

          {/* Info box */}
          <div className="bg-info/5 border border-info/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary text-left">
                Your current role may not include the permissions required for this page. Contact
                your manager or system administrator for access.
              </p>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Convenience wrapper for admin-only pages
 */
export function AdminPageGuard({
  children,
  pageTitle = "Admin Settings",
}: {
  children: ReactNode;
  pageTitle?: string;
}) {
  return (
    <PagePermissionGuard permissions={["system.admin"]} pageTitle={pageTitle} showUnauthorizedPage>
      {children}
    </PagePermissionGuard>
  );
}

/**
 * Convenience wrapper for manager-level pages
 */
export function ManagerPageGuard({
  children,
  pageTitle = "Management",
}: {
  children: ReactNode;
  pageTitle?: string;
}) {
  return (
    <PagePermissionGuard
      permissions={["tasks.manage", "expense.approve", "users.view", "system.admin"]}
      pageTitle={pageTitle}
    >
      {children}
    </PagePermissionGuard>
  );
}
