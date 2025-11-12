"use client";

/**
 * Input Component
 *
 * Reusable text input component following EarthEnable design system.
 * Supports text, email, password, number, and other HTML input types.
 */

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { cn } from "@/src/lib/theme";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * Label for the input
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below input
   */
  helperText?: string;

  /**
   * Size variant
   */
  size?: "sm" | "md" | "lg";

  /**
   * Full width input
   */
  fullWidth?: boolean;

  /**
   * Icon before input
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon after input (toggles with password visibility button)
   */
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      size = "md",
      fullWidth = true,
      type = "text",
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    const sizeStyles = {
      sm: "h-[2.25rem] text-sm", // 36px
      md: "h-[2.75rem] text-base", // 44px
      lg: "h-[3.25rem] text-lg", // 52px
    };

    const paddingStyles = {
      sm: cn(leftIcon ? "pl-9" : "pl-3", rightIcon || isPassword ? "pr-9" : "pr-3"),
      md: cn(leftIcon ? "pl-11" : "pl-4", rightIcon || isPassword ? "pr-11" : "pr-4"),
      lg: cn(leftIcon ? "pl-12" : "pl-6", rightIcon || isPassword ? "pr-12" : "pr-6"),
    };

    return (
      <div className={cn("flex flex-col gap-1", fullWidth && "w-full")}>
        {/* Label */}
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 flex items-center justify-center text-text-secondary",
                size === "sm" ? "w-9" : size === "lg" ? "w-12" : "w-11"
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(
              // Base styles
              "w-full border rounded-md",
              "font-body text-text-primary placeholder:text-text-disabled",
              "transition-colors duration-150",
              "bg-white",

              // Border
              error ? "border-status-error" : "border-border-light",

              // Focus state
              "focus:outline-none focus:ring-2",
              error ? "focus:ring-status-error" : "focus:ring-primary",

              // Hover state
              "hover:border-border-medium",

              // Disabled state
              "disabled:bg-background-light disabled:text-text-disabled disabled:cursor-not-allowed",

              // Size
              sizeStyles[size],

              // Padding
              paddingStyles[size],

              // Custom className
              className
            )}
            {...props}
          />

          {/* Right icon or password toggle */}
          {(rightIcon || isPassword) && (
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 flex items-center justify-center",
                size === "sm" ? "w-9" : size === "lg" ? "w-12" : "w-11"
              )}
            >
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-secondary hover:text-text-primary transition-colors p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye slash icon
                    <svg
                      className={size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      className={size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              ) : (
                <span className="text-text-secondary">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Helper text or error */}
        {(helperText || error) && (
          <p className={cn("text-sm", error ? "text-status-error" : "text-text-secondary")}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
