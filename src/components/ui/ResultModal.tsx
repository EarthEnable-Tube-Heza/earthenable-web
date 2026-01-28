"use client";

/**
 * Result Modal Component
 *
 * Modal for displaying action results (success, error, warning, info)
 * with informative messages guiding users on next steps.
 * Matches EarthEnable design system.
 */

import { cn } from "@/src/lib/theme";

export type ResultModalVariant = "success" | "error" | "warning" | "info";

export interface ResultModalProps {
  isOpen: boolean;
  variant: ResultModalVariant;
  title: string;
  message: string;
  /** Optional secondary message with additional context or next steps */
  secondaryMessage?: string;
  /** Primary action button label */
  actionLabel?: string;
  /** Optional secondary action */
  secondaryActionLabel?: string;
  onAction: () => void;
  onSecondaryAction?: () => void;
}

export function ResultModal({
  isOpen,
  variant,
  title,
  message,
  secondaryMessage,
  actionLabel = "OK",
  secondaryActionLabel,
  onAction,
  onSecondaryAction,
}: ResultModalProps) {
  if (!isOpen) return null;

  // Icon mapping
  const iconMap = {
    success: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    error: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    info: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  // Color mapping matching EarthEnable theme
  const colorMap = {
    success: {
      border: "border-l-status-success",
      icon: "text-status-success",
      title: "text-status-success",
      button: "bg-status-success hover:bg-status-success/90 focus:ring-status-success",
    },
    warning: {
      border: "border-l-status-warning",
      icon: "text-status-warning",
      title: "text-status-warning",
      button: "bg-status-warning hover:bg-status-warning/90 focus:ring-status-warning",
    },
    error: {
      border: "border-l-status-error",
      icon: "text-status-error",
      title: "text-status-error",
      button: "bg-status-error hover:bg-status-error/90 focus:ring-status-error",
    },
    info: {
      border: "border-l-primary",
      icon: "text-primary",
      title: "text-primary",
      button: "bg-primary hover:bg-primary/90 focus:ring-primary",
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          "bg-background-primary rounded-xl shadow-2xl max-w-md w-full border-l-[6px]",
          colorMap[variant].border
        )}
      >
        {/* Icon and Title */}
        <div className="p-6 pb-4 flex flex-col items-center text-center">
          <div className={cn("mb-4", colorMap[variant].icon)}>{iconMap[variant]}</div>
          <h3 className={cn("text-xl font-heading font-bold", colorMap[variant].title)}>{title}</h3>
        </div>

        {/* Message */}
        <div className="px-6 pb-4 text-center">
          <p className="text-text-primary text-base leading-relaxed">{message}</p>
          {secondaryMessage && (
            <p className="text-text-secondary text-sm leading-relaxed mt-3">{secondaryMessage}</p>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 flex gap-3 justify-center">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium transition-colors",
                "border-2 border-secondary text-secondary bg-transparent",
                "hover:bg-secondary hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
              )}
            >
              {secondaryActionLabel}
            </button>
          )}
          <button
            onClick={onAction}
            className={cn(
              "px-8 py-2.5 rounded-lg font-medium transition-colors text-white",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              colorMap[variant].button
            )}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
