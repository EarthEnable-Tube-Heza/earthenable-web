'use client';

/**
 * Authentication Hooks
 *
 * Custom React hooks for authentication and authorization.
 */

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from './AuthContext';
import { UserRole } from '../../types';

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      const redirect = redirectTo || currentPath;
      router.push(`/auth/signin?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to check if user has admin role
 */
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === UserRole.ADMIN;
}

/**
 * Hook to check if user has manager role or higher
 */
export function useIsManager() {
  const { user } = useAuth();
  return user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
}

/**
 * Hook to check if user has QA agent role or higher
 */
export function useIsQAAgent() {
  const { user } = useAuth();
  return (
    user?.role === UserRole.QA_AGENT ||
    user?.role === UserRole.MANAGER ||
    user?.role === UserRole.ADMIN
  );
}

/**
 * Hook to require admin role - redirects to dashboard if not admin
 */
export function useRequireAdmin() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, isLoading, router]);

  return { isAdmin, isLoading };
}

/**
 * Hook to require manager role or higher
 */
export function useRequireManager() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  useEffect(() => {
    if (!isLoading && user && !isManager) {
      router.push('/dashboard');
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
  const isExpiring = timeRemaining <= 24 * 60 * 60 * 1000; // 24 hours

  return {
    isExpiring,
    timeRemaining,
    expiryDate: new Date(tokenExpiry),
  };
}
