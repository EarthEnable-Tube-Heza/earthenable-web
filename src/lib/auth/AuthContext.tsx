'use client';

/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Manages token storage, user state, and automatic token refresh.
 */

import React, { createContext, useCallback, useEffect, useState } from 'react';
import {
  AuthContextValue,
  AuthState,
  User,
  TOKEN_STORAGE_KEYS,
  calculateTokenExpiry,
  shouldRefreshToken,
} from '../../types';
import { apiClient } from '../api';
import { config } from '../config';

/**
 * Initial auth state
 */
const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

/**
 * Auth context
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialAuthState);

  /**
   * Load auth state from localStorage on mount
   */
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Setup automatic token refresh check
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokenExpiry) return;

    // Check token expiry every minute
    const interval = setInterval(() => {
      if (shouldRefreshToken(state.tokenExpiry, config.token.refreshThreshold * 60 * 1000)) {
        refreshAccessToken();
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.tokenExpiry]);

  /**
   * Load stored authentication from localStorage
   */
  const loadStoredAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      const tokenExpiry = localStorage.getItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
      const userStr = localStorage.getItem(TOKEN_STORAGE_KEYS.USER);

      if (accessToken && refreshToken && userStr) {
        const user: User = JSON.parse(userStr);

        setState({
          user,
          accessToken,
          refreshToken,
          tokenExpiry: tokenExpiry ? parseInt(tokenExpiry, 10) : null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Verify token is still valid by fetching current user
        try {
          const currentUser = await apiClient.getCurrentUser();
          setState(prev => ({
            ...prev,
            user: currentUser,
            isLoading: false,
          }));
        } catch (error) {
          // Token invalid, clear auth
          await signOut();
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Sign in with Google token
   */
  const signIn = useCallback(async (googleToken: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Exchange Google token for JWT
      const tokenResponse = await apiClient.authenticateWithGoogle(googleToken);

      // Get user profile
      const user = await apiClient.getCurrentUser();

      // Calculate token expiry
      const tokenExpiry = calculateTokenExpiry(tokenResponse.expires_in);

      // Store tokens and user
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, tokenExpiry.toString());
      localStorage.setItem(TOKEN_STORAGE_KEYS.USER, JSON.stringify(user));

      setState({
        user,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Authentication failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      await apiClient.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      // Clear state and storage regardless of API call result
      localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);

      setState(initialAuthState);
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      // The apiClient handles token refresh internally
      // This method is mainly for manual refresh if needed
      const currentUser = await apiClient.getCurrentUser();

      // Update user in state
      setState(prev => ({
        ...prev,
        user: currentUser,
      }));
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If refresh fails, sign out
      await signOut();
    }
  }, [signOut]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refreshAccessToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
