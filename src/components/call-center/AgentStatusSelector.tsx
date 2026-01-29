"use client";

/**
 * Agent Status Selector Component
 *
 * Dropdown selector for agents to change their availability status.
 * Shows current status with visual indicator.
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/src/lib/theme";
import { AgentStatusEnum, AGENT_STATUS_CONFIG } from "@/src/types/voice";
import { Spinner } from "@/src/components/ui";

interface AgentStatusSelectorProps {
  /** Current status */
  currentStatus: AgentStatusEnum;
  /** Callback when status changes */
  onStatusChange: (status: AgentStatusEnum) => void;
  /** Whether the status is being updated */
  isLoading?: boolean;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md";
  /** ACW countdown in seconds (null if not in ACW or no timeout configured) */
  acwCountdown?: number | null;
  /** Additional class name */
  className?: string;
}

// Statuses that agents can manually select
const selectableStatuses: AgentStatusEnum[] = [
  AgentStatusEnum.AVAILABLE,
  AgentStatusEnum.UNAVAILABLE,
  AgentStatusEnum.AFTER_CALL_WORK,
];

// Format seconds to MM:SS
function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AgentStatusSelector({
  currentStatus,
  onStatusChange,
  isLoading = false,
  disabled = false,
  size = "md",
  acwCountdown,
  className,
}: AgentStatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const config = AGENT_STATUS_CONFIG[currentStatus];
  const isDisabled = disabled || isLoading;

  // Non-selectable statuses (system-controlled) — only BUSY is locked
  // OFFLINE agents need to be able to click to go Available
  const isSystemStatus = currentStatus === AgentStatusEnum.BUSY;

  const sizeStyles = {
    sm: {
      button: "px-2 py-1 text-sm",
      icon: "w-2 h-2",
      dropdown: "text-sm",
    },
    md: {
      button: "px-3 py-2 text-base",
      icon: "w-2.5 h-2.5",
      dropdown: "text-base",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      {/* Status Button */}
      <button
        onClick={() => !isDisabled && !isSystemStatus && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className={cn(
          "flex items-center gap-2 rounded-lg border transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          config.bgColor,
          styles.button,
          isDisabled || isSystemStatus
            ? "cursor-not-allowed opacity-70"
            : "hover:opacity-90 cursor-pointer"
        )}
        title={isSystemStatus ? `${config.label} (system-controlled)` : "Change status"}
      >
        {isLoading ? (
          <Spinner size="sm" />
        ) : (
          <span className={cn("rounded-full", styles.icon, config.dotColor)} />
        )}
        <span className={cn("font-medium", config.color)}>
          {config.label}
          {/* Show ACW countdown */}
          {currentStatus === AgentStatusEnum.AFTER_CALL_WORK &&
            acwCountdown !== null &&
            acwCountdown !== undefined &&
            acwCountdown > 0 && (
              <span className="ml-1 text-xs opacity-75">({formatCountdown(acwCountdown)})</span>
            )}
        </span>
        {!isSystemStatus && (
          <svg
            className={cn("w-4 h-4 transition-transform", config.color, isOpen && "rotate-180")}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-48 rounded-lg bg-white shadow-lg border border-border-light",
            "py-1 right-0",
            styles.dropdown
          )}
        >
          {selectableStatuses.map((status) => {
            const statusConfig = AGENT_STATUS_CONFIG[status];
            const isSelected = status === currentStatus;

            return (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(status);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors",
                  "hover:bg-background-light",
                  isSelected && "bg-background-light"
                )}
              >
                <span className={cn("w-2.5 h-2.5 rounded-full", statusConfig.dotColor)} />
                <span className={cn("font-medium", statusConfig.color)}>{statusConfig.label}</span>
                {isSelected && (
                  <svg
                    className="w-4 h-4 ml-auto text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}

          {/* System status indicator */}
          <div className="border-t border-border-light mt-1 pt-1 px-3 py-2">
            <p className="text-xs text-text-disabled">
              {config.icon} Busy is auto-managed during calls
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
