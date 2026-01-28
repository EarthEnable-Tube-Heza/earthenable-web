"use client";

/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Manages token storage, user state, and automatic token refresh.
 */

import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
  AuthContextValue,
  AuthState,
  User,
  TOKEN_STORAGE_KEYS,
  calculateTokenExpiry,
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
  sessionExpired: false,
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

  // Track last user activity for activity-aware token refresh.
  // Active users get silent refresh; idle users see the expiry modal.
  const lastActivityRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef(false);

  // External activity sources (e.g., call center WebRTC client).
  // If any source returns true, the user is considered active regardless
  // of DOM interaction — they're waiting for calls, on a call, etc.
  const activitySourcesRef = useRef<Set<() => boolean>>(new Set());

  const registerActivitySource = useCallback((source: () => boolean) => {
    activitySourcesRef.current.add(source);
    return () => {
      activitySourcesRef.current.delete(source);
    };
  }, []);

  // Configurable session timing values (all stored in seconds in config, convert to ms).
  const ACTIVITY_IDLE_THRESHOLD_MS = config.session.activityIdleThreshold * 1000;
  const ACTIVITY_THROTTLE_MS = config.session.activityThrottleInterval * 1000;
  const REFRESH_CHECK_INTERVAL_MS = config.session.refreshCheckInterval * 1000;

  /**
   * Track user activity via DOM events (throttled).
   */
  useEffect(() => {
    let throttleTimer: NodeJS.Timeout | null = null;

    const updateActivity = () => {
      if (throttleTimer) return;
      lastActivityRef.current = Date.now();
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, ACTIVITY_THROTTLE_MS);
    };

    const events: (keyof WindowEventMap)[] = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];

    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [ACTIVITY_THROTTLE_MS]);

  /**
   * Activity-aware automatic token refresh.
   *
   * Every 30 seconds, checks whether the token needs refreshing:
   * - If user was recently active AND token is within the refresh threshold:
   *   silently call forceRefreshToken() to extend the session. The user never
   *   sees a modal. This means an active agent will stay signed in indefinitely.
   * - If user is idle AND token enters the critical threshold:
   *   the SessionExpiryModal (driven by tokenExpiry state) shows automatically.
   * - If the refresh fails, sessionExpired is set and the modal handles it.
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.tokenExpiry) return;

    const checkAndRefresh = async () => {
      if (isRefreshingRef.current) return;

      const now = Date.now();
      const timeUntilExpiry = state.tokenExpiry! - now;
      const refreshThresholdMs = config.token.refreshThreshold * 60 * 1000;
      const hadRecentInteraction = now - lastActivityRef.current < ACTIVITY_IDLE_THRESHOLD_MS;

      // Check external activity sources — e.g., call center agent with
      // WebRTC client connected (waiting for calls) or on an active call.
      // These users are working even without mouse/keyboard interaction.
      const hasActiveSource = Array.from(activitySourcesRef.current).some((source) => {
        try {
          return source();
        } catch {
          return false;
        }
      });

      const isUserActive = hadRecentInteraction || hasActiveSource;

      // Within refresh threshold and user is active → silently refresh
      if (timeUntilExpiry <= refreshThresholdMs && timeUntilExpiry > 0 && isUserActive) {
        isRefreshingRef.current = true;
        try {
          const result = await apiClient.forceRefreshToken();
          setState((prev) => ({
            ...prev,
            accessToken: result.accessToken,
            tokenExpiry: result.tokenExpiry,
            sessionExpired: false,
          }));
        } catch {
          // Refresh failed — let the modal handle it
          setState((prev) => ({
            ...prev,
            sessionExpired: true,
            isAuthenticated: false,
          }));
        } finally {
          isRefreshingRef.current = false;
        }
      }
      // If user is idle, we don't refresh proactively.
      // The SessionExpiryModal watches tokenExpiry and shows the
      // "expiring soon" warning when within critical threshold.
    };

    const interval = setInterval(checkAndRefresh, REFRESH_CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated, state.tokenExpiry]);

  /**
   * Register session expired callback with apiClient.
   * When token refresh fails, apiClient calls this instead of hard-redirecting.
   */
  useEffect(() => {
    apiClient.registerSessionExpiredCallback(() => {
      setState((prev) => ({ ...prev, sessionExpired: true, isAuthenticated: false }));
    });

    return () => {
      apiClient.unregisterSessionExpiredCallback();
    };
  }, []);

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

        if (isExpired && !refreshToken) {
          // Token expired AND no refresh token — clear storage
          console.log("Stored token is expired with no refresh token, clearing auth");
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
        if (!isExpired && expiry) {
          const expiryDate = new Date(expiry);
          document.cookie = `earthenable_access_token=${accessToken}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
        }

        // Auto-select entity for single-entity users if not already selected
        let finalSelectedEntityId = selectedEntityId;
        if (
          !finalSelectedEntityId &&
          entityInfo &&
          !entityInfo.is_multi_entity_user &&
          entityInfo.accessible_entities?.length === 1
        ) {
          finalSelectedEntityId = entityInfo.accessible_entities[0].id;
          localStorage.setItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID, finalSelectedEntityId);
        }

        if (isExpired) {
          // Token expired but refresh token exists — try to refresh.
          // Keep isLoading: true so the UI shows a spinner instead of
          // prematurely redirecting to the dashboard or sign-in page.
          try {
            const result = await apiClient.forceRefreshToken();
            // Refresh succeeded — load user with the new token
            const currentUser = await apiClient.getCurrentUser();
            setState({
              user: currentUser,
              accessToken: result.accessToken,
              refreshToken: localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN),
              tokenExpiry: result.tokenExpiry,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              entityInfo,
              selectedEntityId: finalSelectedEntityId,
              sessionExpired: false,
            });
          } catch {
            // Refresh failed — session is expired
            console.log("Token refresh failed during load, session expired");
            localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
            localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
            localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
            localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);
            document.cookie =
              "earthenable_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
            setState({
              ...initialAuthState,
              isLoading: false,
            });
          }
          return;
        }

        // Token is not expired — set authenticated state
        setState({
          user,
          accessToken,
          refreshToken,
          tokenExpiry: expiry,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          entityInfo,
          selectedEntityId: finalSelectedEntityId,
          sessionExpired: false,
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
          // Token invalid, clear storage
          console.log("Token verification failed, clearing auth");
          localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
          localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);
          document.cookie =
            "earthenable_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          // Preserve sessionExpired if the interceptor callback already set it
          setState((prev) => ({
            ...initialAuthState,
            isLoading: false,
            sessionExpired: prev.sessionExpired,
          }));
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
        sessionExpired: false,
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
   * Refresh access token.
   * Directly calls the refresh endpoint to get new tokens.
   * Used by the "Stay Signed In" button and proactive refresh.
   */
  const refreshAccessToken = useCallback(async () => {
    try {
      const result = await apiClient.forceRefreshToken();

      // Also update the activity timestamp so proactive refresh continues
      lastActivityRef.current = Date.now();

      setState((prev) => ({
        ...prev,
        accessToken: result.accessToken,
        tokenExpiry: result.tokenExpiry,
        sessionExpired: false,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Set session expired — let the modal handle it
      setState((prev) => ({
        ...prev,
        sessionExpired: true,
        isAuthenticated: false,
      }));
    }
  }, []);

  /**
   * Acknowledge session expired — clears storage and navigates to sign-in.
   * Called when user clicks "Sign In" on the session expiry modal.
   */
  const acknowledgeSessionExpired = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ENTITY_INFO);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID);

    // Clear cookie
    document.cookie =
      "earthenable_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    // Reset state
    setState({
      ...initialAuthState,
      isLoading: false,
      sessionExpired: false,
    });

    // Navigate to sign-in
    if (typeof window !== "undefined") {
      window.location.href = "/auth/signin";
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Select entity (switch entity context)
   * This updates the JWT tokens to include the selected entity
   */
  const selectEntity = useCallback(async (entityId: string) => {
    try {
      // Call API to switch entity context - returns new tokens with selected_entity_id
      const tokenResponse = await apiClient.selectEntity(entityId);

      // Store the new tokens (they have selected_entity_id embedded)
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token);
      localStorage.setItem(
        TOKEN_STORAGE_KEYS.TOKEN_EXPIRY,
        calculateTokenExpiry(tokenResponse.expires_in).toString()
      );
      localStorage.setItem(TOKEN_STORAGE_KEYS.SELECTED_ENTITY_ID, entityId);

      // Update state
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
    acknowledgeSessionExpired,
    registerActivitySource,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
