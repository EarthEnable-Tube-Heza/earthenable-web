/**
 * Authentication Types
 *
 * TypeScript types for authentication flow and token management.
 */

import { User } from './user';

/**
 * JWT token response from backend
 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number; // seconds until access token expires
}

/**
 * Google OAuth request payload
 */
export interface GoogleAuthRequest {
  token: string; // Google ID token
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null; // Unix timestamp (ms)
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth context value
 */
export interface AuthContextValue extends AuthState {
  signIn: (googleToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
}

/**
 * Token storage keys
 */
export const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'earthenable_access_token',
  REFRESH_TOKEN: 'earthenable_refresh_token',
  TOKEN_EXPIRY: 'earthenable_token_expiry',
  USER: 'earthenable_user',
} as const;

/**
 * Token refresh thresholds (in milliseconds)
 */
export const TOKEN_THRESHOLDS = {
  // Refresh token if expiring within 7 days (configurable via env)
  REFRESH_THRESHOLD: 7 * 24 * 60 * 60 * 1000, // 7 days
  // Show critical warning if expiring within 24 hours (configurable via env)
  CRITICAL_THRESHOLD: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Check if token needs refresh based on expiry time
 */
export function shouldRefreshToken(
  tokenExpiry: number | null,
  threshold: number = TOKEN_THRESHOLDS.REFRESH_THRESHOLD
): boolean {
  if (!tokenExpiry) return false;
  const now = Date.now();
  return tokenExpiry - now <= threshold;
}

/**
 * Check if token is critically expiring soon
 */
export function isTokenCritical(tokenExpiry: number | null): boolean {
  return shouldRefreshToken(tokenExpiry, TOKEN_THRESHOLDS.CRITICAL_THRESHOLD);
}

/**
 * Calculate token expiry timestamp from expires_in seconds
 */
export function calculateTokenExpiry(expiresInSeconds: number): number {
  return Date.now() + expiresInSeconds * 1000;
}
