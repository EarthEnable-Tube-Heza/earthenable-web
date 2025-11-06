'use client';

/**
 * Badge Component
 *
 * Reusable badge/tag component following EarthEnable design system.
 * Used for status indicators, labels, and tags.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/theme';
import { theme } from '@/src/lib/theme/constants';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Visual variant of the badge
   */
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary';

  /**
   * Size of the badge
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Display as outline/border style
   */
  outline?: boolean;

  /**
   * Add a dot indicator before the label
   */
  dot?: boolean;

  /**
   * Make the badge rounded (pill shape)
   */
  rounded?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      outline = false,
      dot = false,
      rounded = true,
      ...props
    },
    ref
  ) => {
    // Variant styles - filled
    const filledVariantStyles = {
      default: 'bg-background-light text-text-primary border-border-light',
      success: 'bg-status-success/10 text-status-success border-status-success/20',
      error: 'bg-status-error/10 text-status-error border-status-error/20',
      warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
      info: 'bg-status-info/10 text-status-info border-status-info/20',
      primary: 'bg-primary/10 text-primary border-primary/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20',
    };

    // Variant styles - outline
    const outlineVariantStyles = {
      default: 'bg-transparent text-text-primary border-border-medium',
      success: 'bg-transparent text-status-success border-status-success',
      error: 'bg-transparent text-status-error border-status-error',
      warning: 'bg-transparent text-status-warning border-status-warning',
      info: 'bg-transparent text-status-info border-status-info',
      primary: 'bg-transparent text-primary border-primary',
      secondary: 'bg-transparent text-secondary border-secondary',
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',  // 8px/2px, 12px text
      md: 'px-2.5 py-1 text-sm',  // 10px/4px, 14px text
      lg: 'px-3 py-1.5 text-base', // 12px/6px, 16px text
    };

    // Dot styles
    const dotStyles = {
      default: 'bg-text-primary',
      success: 'bg-status-success',
      error: 'bg-status-error',
      warning: 'bg-status-warning',
      info: 'bg-status-info',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center gap-1.5',
          'font-body font-medium',
          'border',
          'transition-colors duration-150',

          // Border radius
          rounded ? 'rounded-full' : 'rounded-md',

          // Variant
          outline ? outlineVariantStyles[variant] : filledVariantStyles[variant],

          // Size
          sizeStyles[size],

          // Custom className
          className
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span
            className={cn(
              'rounded-full',
              dotSizes[size],
              dotStyles[variant]
            )}
            aria-hidden="true"
          />
        )}

        {/* Children */}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
