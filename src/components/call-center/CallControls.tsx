"use client";

/**
 * Call Controls Component
 *
 * Action buttons for controlling an active call.
 * Includes mute, hold, transfer, and end call buttons.
 */

import { cn } from "@/src/lib/theme";

interface CallControlsProps {
  /** Whether the call is muted */
  isMuted: boolean;
  /** Whether the call is on hold */
  isOnHold: boolean;
  /** Callback to toggle mute */
  onToggleMute: () => void;
  /** Callback to toggle hold */
  onToggleHold: () => void;
  /** Callback to end the call */
  onEndCall: () => void;
  /** Callback to open transfer dialog */
  onTransfer?: () => void;
  /** Callback to open keypad for DTMF */
  onShowKeypad?: () => void;
  /** Whether the call is connected */
  isConnected?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class name */
  className?: string;
}

interface ControlButtonProps {
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  label: string;
  icon: React.ReactNode;
  size: "sm" | "md" | "lg";
}

function ControlButton({
  onClick,
  active,
  danger,
  disabled,
  label,
  icon,
  size,
}: ControlButtonProps) {
  const sizeConfig = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const iconSize = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          sizeConfig[size],
          danger
            ? cn(
                "bg-status-error text-white hover:bg-status-error/90 active:bg-status-error/80",
                "focus:ring-status-error"
              )
            : active
              ? cn(
                  "bg-primary text-white hover:bg-primary/90 active:bg-primary/80",
                  "focus:ring-primary"
                )
              : cn(
                  "bg-background-light text-text-primary hover:bg-border-light active:bg-border-default",
                  "focus:ring-primary"
                ),
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title={label}
      >
        <span className={iconSize[size]}>{icon}</span>
      </button>
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  );
}

// SVG Icons
const MuteIcon = ({ muted }: { muted: boolean }) =>
  muted ? (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
      />
    </svg>
  ) : (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      />
    </svg>
  );

const HoldIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const KeypadIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zM4 11a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM4 17a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"
    />
  </svg>
);

const TransferIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
    />
  </svg>
);

const EndCallIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
    />
  </svg>
);

export function CallControls({
  isMuted,
  isOnHold,
  onToggleMute,
  onToggleHold,
  onEndCall,
  onTransfer,
  onShowKeypad,
  isConnected = true,
  size = "md",
  className,
}: CallControlsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/* Mute Button */}
      <ControlButton
        onClick={onToggleMute}
        active={isMuted}
        label={isMuted ? "Unmute" : "Mute"}
        icon={<MuteIcon muted={isMuted} />}
        size={size}
        disabled={!isConnected}
      />

      {/* Hold Button */}
      <ControlButton
        onClick={onToggleHold}
        active={isOnHold}
        label={isOnHold ? "Resume" : "Hold"}
        icon={<HoldIcon />}
        size={size}
        disabled={!isConnected}
      />

      {/* Keypad Button */}
      {onShowKeypad && (
        <ControlButton
          onClick={onShowKeypad}
          label="Keypad"
          icon={<KeypadIcon />}
          size={size}
          disabled={!isConnected}
        />
      )}

      {/* Transfer Button */}
      {onTransfer && (
        <ControlButton
          onClick={onTransfer}
          label="Transfer"
          icon={<TransferIcon />}
          size={size}
          disabled={!isConnected}
        />
      )}

      {/* End Call Button */}
      <ControlButton onClick={onEndCall} danger label="End" icon={<EndCallIcon />} size={size} />
    </div>
  );
}
