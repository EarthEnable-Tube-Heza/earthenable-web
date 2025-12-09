"use client";

/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Manages token storage, user state, and automatic token refresh.
 */

import React, { createContext, useCallback, useEffect, useState } from "react";
import {
  AuthContextValue,
  AuthState,
  User,
  TOKEN_STORAGE_KEYS,
  calculateTokenExpiry,
  shouldRefreshToken,
  ExtendedTokenResponse,
  EntityInfo,
} from "../../types";
import { apiClient } from "../api";
import { config } from "../config";

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
  entityInfo: null,
  selectedEntityId: null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const entityInfoStr = localStorage.getItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
      const selectedEntityId = localStorage.getItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);

      if (accessToken && refreshToken && userStr) {
        const user: User = JSON.parse(userStr);
        const expiry = tokenExpiry ? parseInt(tokenExpiry, 10) : null;

        // Parse entityInfo with error handling
        let entityInfo: EntityInfo | null = null;
        if (entityInfoStr && entityInfoStr.trim()) {
          try {
            entityInfo = JSON.parse(entityInfoStr);
          } catch (error) {
            console.error("Failed to parse entity info:", error);
            // Clear invalid entity info from storage
            localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
            localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);
          }
        }

        // Check if token is expired
        const isExpired = expiry ? expiry <= Date.now() : false;

        if (isExpired) {
          // Token expired, clear storage directly (don't call signOut to avoid circular dependency)
          console.log("Stored token is expired, clearing auth");
          localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);
          document.cookie =
            "earthenable_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        // Set cookie for middleware (only if token is not expired)
        if (expiry) {
          const expiryDate = new Date(expiry);
          document.cookie = `earthenable_access_token=${accessToken}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
        }

        setState({
          user,
          accessToken,
          refreshToken,
          tokenExpiry: expiry,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          entityInfo,
          selectedEntityId,
        });

        // Verify token is still valid by fetching current user
        try {
          const currentUser = await apiClient.getCurrentUser();
          setState((prev) => ({
            ...prev,
            user: currentUser,
            isLoading: false,
          }));
        } catch {
          // Token invalid, clear storage directly (don't call signOut to avoid circular dependency)
          console.log("Token verification failed, clearing auth");
          localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);
          document.cookie =
            "earthenable_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          // Reset to unauthenticated state with isLoading: false to show sign-in form
          setState({
            ...initialAuthState,
            isLoading: false,
          });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  /**
   * Sign in with Google token
   */
  const signIn = useCallback(async (googleToken: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Exchange Google token for JWT (now returns ExtendedTokenResponse with entity_info)
      const tokenResponse: ExtendedTokenResponse =
        await apiClient.authenticateWithGoogle(googleToken);

      // Calculate token expiry
      const tokenExpiry = calculateTokenExpiry(tokenResponse.expires_in);

      // Store tokens in localStorage (for API client)
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY, tokenExpiry.toString());

      // Store entity information
      localStorage.setItem(
        TOKEN_STORAGE_KEYS.ENTITY_INFO,
        JSON.stringify(tokenResponse.entity_info)
      );

      // Auto-select for single-entity users, null for multi-entity users (they use modal)
      let selectedEntityId = null;
      if (
        !tokenResponse.entity_info.is_multi_entity_user &&
        tokenResponse.entity_info.accessible_entities.length === 1
      ) {
        // Single-entity user - auto-select their only entity
        selectedEntityId = tokenResponse.entity_info.accessible_entities[0].id;
        localStorage.setItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID, selectedEntityId);
      }
      // Multi-entity users must explicitly select via modal

      // Also store access token in cookies (for middleware)
      // Calculate expiry date for cookie (convert expires_in seconds to Date)
      const expiryDate = new Date(Date.now() + tokenResponse.expires_in * 1000);
      document.cookie = `earthenable_access_token=${tokenResponse.access_token}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;

      // NOW get user profile (API client will find token in localStorage)
      const user = await apiClient.getCurrentUser();

      // Store user
      localStorage.setItem(TOKEN_STORAGE_KEYS.USER, JSON.stringify(user));

      setState({
        user,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        entityInfo: tokenResponse.entity_info,
        selectedEntityId,
      });
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      const errorMessage = error.response?.data?.detail || "Authentication failed";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw err;
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      await apiClient.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
      localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);

      // Clear cookie (set expired date)
      document.cookie =
        "earthenable_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

      // Reset state to unauthenticated with isLoading: false
      setState({
        ...initialAuthState,
        isLoading: false,
      });
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
      setState((prev) => ({
        ...prev,
        user: currentUser,
      }));
    } catch (error) {
      console.error("Error refreshing token:", error);
      // If refresh fails, sign out
      await signOut();
    }
  }, [signOut]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Select entity (switch entity context)
   */
  const selectEntity = useCallback(async (entityId: string) => {
    try {
      // Call API to switch entity context (backend will return new token with updated context)
      await apiClient.selectEntity(entityId);

      // Update local state
      localStorage.setItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID, entityId);
      setState((prev) => ({ ...prev, selectedEntityId: entityId }));
    } catch (error) {
      console.error("Failed to switch entity:", error);
      throw error;
    }
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    refreshAccessToken,
    selectEntity,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
