'use client';

/**
 * Spinner Component
 *
 * Reusable loading spinner component following EarthEnable design system.
 * Used to indicate loading states throughout the application.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/theme';
import { theme } from '@/src/lib/theme/constants';

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
    // Size styles
    const sizeStyles = {
      xs: 'w-3 h-3',    // 12px
      sm: 'w-4 h-4',    // 16px
      md: 'w-5 h-5',    // 20px
      lg: 'w-6 h-6',    // 24px
      xl: 'w-8 h-8',    // 32px
    };

    // Stroke width based on size
    const strokeWidth = {
      xs: '3',
      sm: '3',
      md: '4',
      lg: '4',
      xl: '4',
    };

    // Color variants
    const colorStyles = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      white: 'text-white',
      current: 'text-current',
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
        <svg
          className={cn(
            'animate-spin',
            sizeStyles[size],
            colorStyles[variant]
          )}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={strokeWidth[size]}
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
