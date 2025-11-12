"use client";

/**
 * Button Component
 *
 * Reusable button component following EarthEnable design system.
 * Matches mobile app button styles for consistency.
 */

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/src/lib/theme";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant of the button
   */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";

  /**
   * Size of the button
   */
  size?: "sm" | "md" | "lg";

  /**
   * Full width button
   */
  fullWidth?: boolean;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Icon before text
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon after text
   */
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Variant styles using theme constants
    const variantStyles = {
      primary: cn(
        "bg-primary text-text-inverse border-primary",
        "hover:bg-primary/90 hover:border-primary/90",
        "active:bg-primary/80",
        "disabled:bg-primary/50 disabled:border-primary/50"
      ),
      secondary: cn(
        "bg-secondary text-text-inverse border-secondary",
        "hover:bg-secondary/90 hover:border-secondary/90",
        "active:bg-secondary/80",
        "disabled:bg-secondary/50 disabled:border-secondary/50"
      ),
      outline: cn(
        "bg-transparent text-primary border-primary",
        "hover:bg-primary/10",
        "active:bg-primary/20",
        "disabled:text-primary/50 disabled:border-primary/50"
      ),
      ghost: cn(
        "bg-transparent text-text-primary border-transparent",
        "hover:bg-background-light",
        "active:bg-border-light",
        "disabled:text-text-disabled"
      ),
      danger: cn(
        "bg-status-error text-text-inverse border-status-error",
        "hover:bg-status-error/90 hover:border-status-error/90",
        "active:bg-status-error/80",
        "disabled:bg-status-error/50 disabled:border-status-error/50"
      ),
    };

    // Size styles using theme constants
    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm min-h-[2.25rem]", // 36px
      md: "px-4 py-2.5 text-base min-h-[2.75rem]", // 44px
      lg: "px-6 py-3.5 text-lg min-h-[3.25rem]", // 52px
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2",
          "font-body font-medium",
          "border rounded-md",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",

          // Variant
          variantStyles[variant],

          // Size
          sizeStyles[size],

          // Full width
          fullWidth && "w-full",

          // Custom className
          className
        )}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className={cn(
              "animate-spin",
              size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Left icon */}
        {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}

        {/* Children */}
        {children}

        {/* Right icon */}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
