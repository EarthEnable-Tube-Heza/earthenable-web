'use client';

/**
 * Select Component
 *
 * Reusable dropdown/select component with consistent styling using theme constants.
 * Features a custom dropdown arrow and follows EarthEnable design system.
 */

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/theme';
import { theme } from '@/src/lib/theme/constants';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Optional error state
   */
  error?: boolean;

  /**
   * Size variant
   */
  size?: 'sm' | 'default' | 'lg';

  /**
   * Full width
   */
  fullWidth?: boolean;
}

/**
 * Custom dropdown arrow SVG (embedded as data URI)
 */
const DROPDOWN_ARROW_SVG = `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23666666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, size = 'default', fullWidth = true, style, ...props }, ref) => {
    const sizeStyles = {
      sm: {
        height: theme.formInputs.height.sm,
        paddingLeft: theme.formInputs.padding.x,
        paddingRight: theme.formInputs.padding.selectRight,
        paddingTop: '0.375rem', // py-1.5
        paddingBottom: '0.375rem',
      },
      default: {
        height: theme.formInputs.height.default,
        paddingLeft: theme.formInputs.padding.x,
        paddingRight: theme.formInputs.padding.selectRight,
        paddingTop: theme.formInputs.padding.y,
        paddingBottom: theme.formInputs.padding.y,
      },
      lg: {
        height: theme.formInputs.height.lg,
        paddingLeft: theme.formInputs.padding.x,
        paddingRight: theme.formInputs.padding.selectRight,
        paddingTop: '0.875rem', // py-3.5
        paddingBottom: '0.875rem',
      },
    };

    return (
      <select
        ref={ref}
        className={cn(
          // Base styles
          'appearance-none bg-white border rounded-md',
          'font-body text-base text-text-primary',
          'transition-colors duration-150',

          // Border
          error ? 'border-status-error' : 'border-border-light',

          // Focus state
          'focus:outline-none focus:ring-2',
          error ? 'focus:ring-status-error' : 'focus:ring-primary',

          // Hover state
          'hover:border-border-medium',

          // Disabled state
          'disabled:bg-background-light disabled:text-text-disabled disabled:cursor-not-allowed',

          // Width
          fullWidth ? 'w-full' : 'w-auto',

          // Custom class
          className
        )}
        style={{
          ...sizeStyles[size],
          backgroundImage: DROPDOWN_ARROW_SVG,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px 16px',
          backgroundPosition: `right ${theme.formInputs.padding.x} center`,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';
