'use client';

/**
 * Alert Component
 *
 * Inline alert component matching mobile app's ThemedAlert styling.
 * Features cream background with colored left border.
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/theme';
import { theme } from '@/src/lib/theme/constants';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Alert variant/type
   */
  variant?: 'info' | 'success' | 'warning' | 'error';

  /**
   * Alert title
   */
  title?: string;

  /**
   * Show icon
   */
  showIcon?: boolean;

  /**
   * Dismissible alert with close button
   */
  dismissible?: boolean;

  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      children,
      className,
      variant = 'info',
      title,
      showIcon = true,
      dismissible = false,
      onDismiss,
      ...props
    },
    ref
  ) => {
    // Icon mapping
    const iconMap = {
      success: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      warning: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      error: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      info: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    };

    // Color mapping matching mobile app
    const colorMap = {
      success: {
        border: 'border-l-status-success',
        icon: 'text-status-success',
        title: 'text-status-success',
      },
      warning: {
        border: 'border-l-status-warning',
        icon: 'text-status-warning',
        title: 'text-status-warning',
      },
      error: {
        border: 'border-l-status-error',
        icon: 'text-status-error',
        title: 'text-status-error',
      },
      info: {
        border: 'border-l-primary',
        icon: 'text-primary',
        title: 'text-primary',
      },
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          // Base styles matching mobile app's ThemedAlert
          'relative p-4 rounded-lg border-l-[6px]',
          'bg-background-primary', // #F7EDDB - Cream background
          'shadow-md',

          // Variant border color
          colorMap[variant].border,

          // Custom className
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          {/* Icon */}
          {showIcon && (
            <div className={cn('flex-shrink-0', colorMap[variant].icon)}>
              {iconMap[variant]}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            {title && (
              <h4
                className={cn(
                  'font-heading font-bold text-base mb-1',
                  colorMap[variant].title
                )}
              >
                {title}
              </h4>
            )}

            {/* Message */}
            <div className="text-sm text-text-secondary font-body leading-relaxed">
              {children}
            </div>
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 rounded-md p-1.5',
                'hover:bg-secondary/10 transition-colors',
                'text-text-secondary hover:text-text-primary',
                'focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              aria-label="Dismiss"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
