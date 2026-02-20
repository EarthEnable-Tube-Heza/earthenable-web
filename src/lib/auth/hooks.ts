"use client";

/**
 * Authentication Hooks
 *
 * Custom React hooks for authentication and authorization.
 */

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "./AuthContext";
import { config } from "../config";

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

/**
 * Hook to get current user
 * Returns null if not authenticated
 */
export function useUser() {
  const { user } = useAuth();
  return user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to protect routes - redirects to sign in if not authenticated
 * @param redirectTo - Path to redirect to after sign in (default: current path)
 */
export function useRequireAuth(redirectTo?: string) {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip redirect when sessionExpired — the modal handles it
    if (!isLoading && !isAuthenticated && !sessionExpired) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
      const redirect = redirectTo || currentPath;
      router.push(`/auth/signin?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, isLoading, sessionExpired, router, redirectTo]);

  return { isAuthenticated, isLoading, sessionExpired };
}

/**
 * Hook to check if user is a superuser (admin).
 * Uses is_superuser flag instead of role string comparison.
 */
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.is_superuser === true;
}

/**
 * Hook to check if user has manager privileges or higher.
 * Uses is_superuser flag instead of role string comparison.
 */
export function useIsManager() {
  const { user } = useAuth();
  return user?.is_superuser === true;
}

/**
 * Hook to check if user has QA agent role or higher.
 * Superusers always have access; otherwise check via permissions.
 */
export function useIsQAAgent() {
  const { user } = useAuth();
  return user?.is_superuser === true;
}

/**
 * Hook to require admin (superuser) - redirects to dashboard if not.
 */
export function useRequireAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.is_superuser === true;

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, isAdmin, isLoading, router]);

  return { isAdmin, isLoading };
}

/**
 * Hook to require manager privileges or higher (superuser).
 */
export function useRequireManager() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isManager = user?.is_superuser === true;

  useEffect(() => {
    if (!isLoading && user && !isManager) {
      router.push("/dashboard");
    }
  }, [user, isManager, isLoading, router]);

  return { isManager, isLoading };
}

/**
 * Hook to check if token is expiring soon
 * Returns true if token will expire within critical threshold
 */
export function useTokenExpiry() {
  const { tokenExpiry } = useAuth();

  if (!tokenExpiry) return { isExpiring: false, timeRemaining: null };

  const now = Date.now();
  const timeRemaining = tokenExpiry - now;
  const isExpiring = timeRemaining <= config.token.criticalThreshold * 60 * 1000;

  return {
    isExpiring,
    timeRemaining,
    expiryDate: new Date(tokenExpiry),
  };
}
