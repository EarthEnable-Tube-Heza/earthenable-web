"use client";

/**
 * Dialpad Component
 *
 * Phone-style dialpad for entering numbers.
 * Supports click and keyboard input.
 */

import { useCallback } from "react";
import { cn } from "@/src/lib/theme";

interface DialpadProps {
  /** Current value in the input */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when call button is pressed */
  onCall?: () => void;
  /** Callback when a digit is pressed (for DTMF) */
  onDigitPress?: (digit: string) => void;
  /** Whether call button is disabled */
  callDisabled?: boolean;
  /** Whether to show the call button */
  showCallButton?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional class name */
  className?: string;
}

const dialpadButtons = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "*", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

export function Dialpad({
  value,
  onChange,
  onCall,
  onDigitPress,
  callDisabled = false,
  showCallButton = true,
  size = "md",
  className,
}: DialpadProps) {
  const handleDigitClick = useCallback(
    (digit: string) => {
      onChange(value + digit);
      onDigitPress?.(digit);
    },
    [value, onChange, onDigitPress]
  );

  const handleBackspace = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: "w-14 h-14",
      digit: "text-xl",
      letters: "text-[8px]",
      input: "text-lg h-10",
      gap: "gap-2",
    },
    md: {
      button: "w-16 h-16",
      digit: "text-2xl",
      letters: "text-[10px]",
      input: "text-xl h-12",
      gap: "gap-3",
    },
    lg: {
      button: "w-20 h-20",
      digit: "text-3xl",
      letters: "text-xs",
      input: "text-2xl h-14",
      gap: "gap-4",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Number Input Display */}
      <div className="w-full mb-4">
        <div className="relative">
          <input
            type="tel"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter phone number"
            className={cn(
              "w-full text-center font-body bg-background-light border border-border-light rounded-lg",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "placeholder:text-text-disabled",
              config.input
            )}
          />
          {value && (
            <button
              onClick={handleBackspace}
              onDoubleClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-text-primary"
              title="Backspace (double-click to clear)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dialpad Grid */}
      <div className={cn("grid grid-cols-3", config.gap)}>
        {dialpadButtons.map(({ digit, letters }) => (
          <button
            key={digit}
            onClick={() => handleDigitClick(digit)}
            className={cn(
              "flex flex-col items-center justify-center rounded-full",
              "bg-background-light hover:bg-border-light active:bg-primary active:text-white",
              "transition-colors duration-100",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              config.button
            )}
          >
            <span className={cn("font-body font-semibold", config.digit)}>{digit}</span>
            {letters && (
              <span className={cn("text-text-secondary uppercase tracking-wider", config.letters)}>
                {letters}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Call Button */}
      {showCallButton && (
        <button
          onClick={onCall}
          disabled={callDisabled || !value}
          className={cn(
            "mt-4 flex items-center justify-center rounded-full",
            "bg-status-success text-white",
            "hover:bg-status-success/90 active:bg-status-success/80",
            "disabled:bg-status-success/50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-status-success focus:ring-offset-2",
            size === "sm" ? "w-14 h-14" : size === "lg" ? "w-20 h-20" : "w-16 h-16"
          )}
        >
          <svg
            className={cn(size === "sm" ? "w-6 h-6" : size === "lg" ? "w-10 h-10" : "w-8 h-8")}
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
          </svg>
        </button>
      )}
    </div>
  );
}
