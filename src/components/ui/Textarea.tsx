'use client';

/**
 * Textarea Component
 *
 * Reusable multi-line text input component following EarthEnable design system.
 * Supports all standard textarea functionality with consistent styling.
 */

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/theme';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label for the textarea
   */
  label?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Helper text to display below textarea
   */
  helperText?: string;

  /**
   * Size variant (affects padding and font size)
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Full width textarea
   */
  fullWidth?: boolean;

  /**
   * Minimum number of rows
   */
  minRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      size = 'md',
      fullWidth = true,
      minRows = 3,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const sizeStyles = {
      sm: 'text-sm py-2', // Small text, small padding
      md: 'text-base py-3', // Medium text, medium padding
      lg: 'text-lg py-4', // Large text, large padding
    };

    const paddingHorizontal = {
      sm: 'px-3',
      md: 'px-4',
      lg: 'px-6',
    };

    return (
      <div className={cn('flex flex-col gap-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
            {props.required && (
              <span className="text-status-error ml-1">*</span>
            )}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={minRows}
          className={cn(
            // Base styles
            'w-full border rounded-md',
            'font-body text-text-primary placeholder:text-text-disabled',
            'transition-colors duration-150',
            'bg-white',
            'resize-y', // Allow vertical resizing only

            // Border
            error ? 'border-status-error' : 'border-border-light',

            // Focus state
            'focus:outline-none focus:ring-2',
            error ? 'focus:ring-status-error' : 'focus:ring-primary',

            // Hover state
            'hover:border-border-medium',

            // Disabled state
            'disabled:bg-background-light disabled:text-text-disabled disabled:cursor-not-allowed disabled:resize-none',

            // Size (text size and vertical padding)
            sizeStyles[size],

            // Horizontal padding
            paddingHorizontal[size],

            // Custom className
            className
          )}
          {...props}
        />

        {/* Helper text or error */}
        {(helperText || error) && (
          <p
            className={cn(
              'text-sm',
              error ? 'text-status-error' : 'text-text-secondary'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
