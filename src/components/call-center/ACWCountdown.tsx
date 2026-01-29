"use client";

/**
 * ACW (After Call Work) Countdown Component
 *
 * A self-contained countdown timer that manages its own state and re-renders.
 * Used to display remaining ACW time and auto-transition to Available status.
 *
 * This component is intentionally separate from AgentStatusSelector to ensure
 * proper re-rendering of the countdown without affecting the status component.
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/src/lib/theme";

interface ACWCountdownProps {
  /** Total timeout in seconds */
  timeoutSeconds: number;
  /** Callback when countdown reaches zero */
  onComplete: () => void;
  /** Optional callback when countdown is cancelled (e.g., status changed manually) */
  onCancel?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class name */
  className?: string;
}

// Format seconds to M:SS or MM:SS
function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ACWCountdown({
  timeoutSeconds,
  onComplete,
  size = "md",
  className,
}: ACWCountdownProps) {
  // Store the initial timeout to calculate progress
  const initialTimeout = useRef(timeoutSeconds);
  const [remaining, setRemaining] = useState(timeoutSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCompletedRef = useRef(false);

  // Memoize onComplete to avoid dependency issues
  const handleComplete = useCallback(() => {
    if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    // Reset state when component mounts
    setRemaining(timeoutSeconds);
    initialTimeout.current = timeoutSeconds;
    hasCompletedRef.current = false;

    // Start the countdown interval
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          // Clear interval and trigger completion
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // Use setTimeout to avoid calling setState during render
          setTimeout(handleComplete, 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeoutSeconds, handleComplete]);

  // Calculate progress percentage for visual indicator
  const progress = (remaining / initialTimeout.current) * 100;

  const sizeStyles = {
    sm: {
      container: "px-2 py-1 text-xs",
      icon: "w-3 h-3",
    },
    md: {
      container: "px-3 py-1.5 text-sm",
      icon: "w-4 h-4",
    },
    lg: {
      container: "px-4 py-2 text-base",
      icon: "w-5 h-5",
    },
  };

  const styles = sizeStyles[size];

  // Determine color based on remaining time
  const isUrgent = remaining <= 10;
  const isWarning = remaining <= 30 && !isUrgent;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border transition-colors",
        isUrgent
          ? "bg-status-error/10 border-status-error/30 text-status-error"
          : isWarning
            ? "bg-status-warning/10 border-status-warning/30 text-status-warning"
            : "bg-status-info/10 border-status-info/30 text-status-info",
        styles.container,
        className
      )}
    >
      {/* Animated timer icon */}
      <svg
        className={cn(styles.icon, "animate-pulse")}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Countdown display */}
      <span className="font-mono font-medium tabular-nums">{formatCountdown(remaining)}</span>

      {/* Progress bar */}
      <div className="w-12 h-1.5 bg-current/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-current transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
