'use client';

/**
 * Spinner Component
 *
 * Reusable loading spinner component following EarthEnable design system.
 * Uses incomplete circle (border-b-2) animation consistent with loading states throughout the app.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/theme';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the spinner
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Color variant
   */
  variant?: 'primary' | 'secondary' | 'white' | 'current';

  /**
   * Label for accessibility
   */
  label?: string;

  /**
   * Center the spinner in its container
   */
  centered?: boolean;
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      variant = 'primary',
      label = 'Loading',
      centered = false,
      ...props
    },
    ref
  ) => {
    // Size styles - diameter and bottom border width (incomplete circle)
    const sizeStyles = {
      xs: 'w-4 h-4 border-b-2',     // 16px with 2px bottom border
      sm: 'w-5 h-5 border-b-2',     // 20px with 2px bottom border
      md: 'w-8 h-8 border-b-2',     // 32px with 2px bottom border (default)
      lg: 'w-12 h-12 border-b-2',   // 48px with 2px bottom border
      xl: 'w-16 h-16 border-b-4',   // 64px with 4px bottom border
    };

    // Color variants - border color (border-b-2 already specifies the side)
    const colorStyles = {
      primary: 'border-primary',
      secondary: 'border-secondary',
      white: 'border-white',
      current: 'border-current',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center',
          centered && 'w-full',
          className
        )}
        role="status"
        aria-label={label}
        {...props}
      >
        <div
          className={cn(
            'animate-spin rounded-full',
            sizeStyles[size],
            colorStyles[variant]
          )}
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
