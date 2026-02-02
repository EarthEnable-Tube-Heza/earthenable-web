"use client";

/**
 * Session Expiry Modal
 *
 * Two states:
 * 1. "Expiring soon" — when token is near critical threshold. Shows countdown + "Stay Signed In" button.
 * 2. "Expired" — when sessionExpired is true. Shows "Sign In" button.
 *
 * Non-dismissable. Renders above all other UI (z-[100]).
 */

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/src/lib/auth";
import { config } from "@/src/lib/config";
import { Button } from "./Button";

export function SessionExpiryModal() {
  const {
    tokenExpiry,
    sessionExpired,
    isAuthenticated,
    refreshAccessToken,
    acknowledgeSessionExpired,
  } = useAuth();

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const criticalThresholdMs = config.token.criticalThreshold * 60 * 1000;

  // Update countdown every second when approaching expiry
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiry || sessionExpired) return;

    const updateCountdown = () => {
      const remaining = tokenExpiry - Date.now();
      if (remaining <= criticalThresholdMs && remaining > 0) {
        setTimeRemaining(remaining);
      } else {
        setTimeRemaining(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, tokenExpiry, sessionExpired, criticalThresholdMs]);

  const handleStaySignedIn = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAccessToken();
      setTimeRemaining(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAccessToken]);

  const handleSignIn = useCallback(() => {
    acknowledgeSessionExpired();
  }, [acknowledgeSessionExpired]);

  // Determine modal state
  const showExpiring = isAuthenticated && timeRemaining !== null && timeRemaining > 0;
  const showExpired = sessionExpired;

  if (!showExpiring && !showExpired) return null;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md mx-4 bg-background-cream rounded-xl shadow-2xl border-l-[6px] border-l-status-warning overflow-hidden">
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-status-warning/10 flex items-center justify-center">
              {showExpired ? (
                // Lock icon
                <svg
                  className="w-8 h-8 text-status-warning"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              ) : (
                // Clock icon
                <svg
                  className="w-8 h-8 text-status-warning"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-heading font-semibold text-text-primary text-center mb-2">
            {showExpired ? "Session Expired" : "Session Expiring Soon"}
          </h2>

          {/* Description */}
          <p className="text-sm text-text-secondary text-center mb-6">
            {showExpired
              ? "Your session has expired. Please sign in again to continue."
              : "Your session is about to expire. Click below to stay signed in."}
          </p>

          {/* Countdown timer (expiring state only) */}
          {showExpiring && timeRemaining !== null && (
            <div className="text-center mb-6">
              <div className="inline-block px-4 py-2 bg-status-warning/10 rounded-lg">
                <span className="text-2xl font-mono font-bold text-status-warning">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-center">
            {showExpired ? (
              <Button variant="primary" size="lg" onClick={handleSignIn} className="w-full">
                Sign In
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleStaySignedIn}
                loading={isRefreshing}
                className="w-full"
              >
                Stay Signed In
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
