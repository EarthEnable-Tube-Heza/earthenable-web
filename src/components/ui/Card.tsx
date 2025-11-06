"use client";

/**
 * Card Component
 *
 * Reusable container component following EarthEnable design system.
 * Provides consistent spacing, borders, and shadows for content sections.
 */

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/src/lib/theme";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the card
   */
  variant?: "default" | "bordered" | "elevated";

  /**
   * Padding size
   */
  padding?: "none" | "sm" | "md" | "lg";

  /**
   * Header content
   */
  header?: React.ReactNode;

  /**
   * Footer content
   */
  footer?: React.ReactNode;

  /**
   * Whether to show dividers between header/body/footer
   */
  divided?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = "default",
      padding = "md",
      header,
      footer,
      divided = false,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      default: "bg-white border border-border-light",
      bordered: "bg-white border-2 border-border-medium",
      elevated: "bg-white shadow-md border border-border-light",
    };

    // Padding styles
    const paddingStyles = {
      none: "",
      sm: "p-3", // 12px
      md: "p-6", // 24px
      lg: "p-8", // 32px
    };

    // Header/footer padding (slightly less than body)
    const headerFooterPadding = {
      none: "",
      sm: "px-3 py-2",
      md: "px-6 py-4",
      lg: "px-8 py-5",
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "rounded-lg overflow-hidden",
          "transition-shadow duration-150",

          // Variant
          variantStyles[variant],

          // No padding if header/footer exists (padding applied to sections)
          !header && !footer && paddingStyles[padding],

          // Custom className
          className
        )}
        {...props}
      >
        {/* Header */}
        {header && (
          <div
            className={cn(
              "font-heading text-lg font-medium text-text-primary",
              headerFooterPadding[padding],
              divided && "border-b border-border-light"
            )}
          >
            {header}
          </div>
        )}

        {/* Body */}
        <div className={cn(header || footer ? paddingStyles[padding] : undefined)}>{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "text-sm text-text-secondary",
              headerFooterPadding[padding],
              divided && "border-t border-border-light"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
