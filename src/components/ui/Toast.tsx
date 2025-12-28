"use client";

/**
 * Toast Component
 *
 * Auto-dismissing toast notification matching mobile app's FeedbackToast.
 * Used for temporary feedback messages.
 */

import { useEffect, useState } from "react";
import { cn } from "@/src/lib/theme";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastPosition = "top" | "bottom";

export interface ToastProps {
  /**
   * Toast visibility
   */
  visible: boolean;

  /**
   * Toast type/variant
   */
  type: ToastType;

  /**
   * Toast message
   */
  message: string;

  /**
   * Auto-dismiss duration in milliseconds
   */
  duration?: number;

  /**
   * Position on screen
   */
  position?: ToastPosition;

  /**
   * Callback when toast is dismissed
   */
  onDismiss?: () => void;

  /**
   * Custom icon (optional)
   */
  icon?: React.ReactNode;
}

/**
 * Toast configuration matching mobile app colors
 */
const TOAST_CONFIG = {
  success: {
    bg: "bg-[#2ecc71]", // Green
    text: "text-white",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  error: {
    bg: "bg-[#e74c3c]", // Red
    text: "text-white",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  warning: {
    bg: "bg-[#f39c12]", // Orange
    text: "text-white",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  info: {
    bg: "bg-[#3498db]", // Blue
    text: "text-white",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
} as const;

export function Toast({
  visible,
  type,
  message,
  duration = 4000,
  position = "top",
  onDismiss,
  icon,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Show toast with animation
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300); // Match animation duration
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        // Base styles - centered positioning
        "fixed z-[1000]",
        "flex items-center gap-3",
        "px-4 py-3 rounded-lg",
        "shadow-lg",
        "transition-all duration-300 ease-out",

        // Centered with responsive percentage widths
        "left-1/2 -translate-x-1/2",
        // Mobile: ~100% width (with margins via calc)
        "w-[calc(100%-2rem)]",
        // Tablet: 80% width
        "md:w-[80%]",
        // Desktop: 50% width
        "lg:w-[50%]",

        // Position
        position === "top" ? "top-4" : "bottom-4",

        // Background and text
        config.bg,
        config.text,

        // Animation states
        isAnimating
          ? "opacity-100 translate-y-0"
          : position === "top"
            ? "opacity-0 -translate-y-4"
            : "opacity-0 translate-y-4"
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{icon || config.icon}</div>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-5 line-clamp-3">{message}</p>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          "flex-shrink-0 rounded-md p-1",
          "hover:bg-white/20 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-white/50"
        )}
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

Toast.displayName = "Toast";
