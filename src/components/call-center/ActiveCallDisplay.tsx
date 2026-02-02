"use client";

/**
 * Active Call Display Component
 *
 * Shows information about the current active call including
 * phone number, contact name, duration, and call status.
 */

import { cn } from "@/src/lib/theme";
import { formatDuration } from "@/src/types/voice";
import { CallDirection } from "@/src/types";

interface ActiveCallDisplayProps {
  /** Phone number of the other party */
  phoneNumber: string;
  /** Contact name (if known) */
  contactName?: string;
  /** Call direction */
  direction: CallDirection;
  /** Duration in seconds */
  duration: number;
  /** Call state description */
  status: "dialing" | "ringing" | "connected" | "on_hold" | "ended";
  /** Additional class name */
  className?: string;
}

export function ActiveCallDisplay({
  phoneNumber,
  contactName,
  direction,
  duration,
  status,
  className,
}: ActiveCallDisplayProps) {
  // Status display configuration
  const statusConfig = {
    dialing: {
      text: "Dialing...",
      color: "text-status-info",
      animate: true,
    },
    ringing: {
      text: direction === CallDirection.INBOUND ? "Incoming call..." : "Ringing...",
      color: "text-status-warning",
      animate: true,
    },
    connected: {
      text: formatDuration(duration),
      color: "text-status-success",
      animate: false,
    },
    on_hold: {
      text: `On Hold - ${formatDuration(duration)}`,
      color: "text-status-warning",
      animate: true,
    },
    ended: {
      text: "Call ended",
      color: "text-text-secondary",
      animate: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex flex-col items-center text-center py-4", className)}>
      {/* Avatar / Icon */}
      <div
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center mb-4",
          "bg-background-light border-2",
          status === "connected"
            ? "border-status-success"
            : status === "on_hold"
              ? "border-status-warning"
              : "border-border-light"
        )}
      >
        {direction === CallDirection.INBOUND ? (
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 3v4m0-4l3 3m-3-3l-3 3"
            />
          </svg>
        ) : (
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10V6m0 4l3-3m-3 3l-3-3"
            />
          </svg>
        )}
      </div>

      {/* Contact Info */}
      <div className="mb-2">
        {contactName ? (
          <>
            <h3 className="text-xl font-heading font-semibold text-text-primary">{contactName}</h3>
            <p className="text-sm text-text-secondary">{phoneNumber}</p>
          </>
        ) : (
          <h3 className="text-xl font-heading font-semibold text-text-primary">{phoneNumber}</h3>
        )}
      </div>

      {/* Call Status / Duration */}
      <div className="flex items-center gap-2">
        {config.animate && (
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                status === "on_hold" ? "bg-status-warning" : "bg-status-info"
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                status === "on_hold" ? "bg-status-warning" : "bg-status-info"
              )}
            />
          </span>
        )}
        <span className={cn("text-lg font-body font-medium", config.color)}>{config.text}</span>
      </div>

      {/* Direction indicator */}
      <p className="text-xs text-text-disabled mt-1">
        {direction === CallDirection.INBOUND ? "Incoming call" : "Outgoing call"}
      </p>
    </div>
  );
}
