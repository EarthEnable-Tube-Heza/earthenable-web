/**
 * Theme Utility Functions
 *
 * Helper functions for working with the EarthEnable theme system.
 */

import { theme } from './constants';

/**
 * Get color value by path
 * @example getColor('primary') // '#EA6A00'
 * @example getColor('background.primary') // '#F7EDDB'
 */
export function getColor(path: string): string {
  const parts = path.split('.');
  let value: any = theme.colors;

  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found in theme`);
      return '#000000'; // Fallback color
    }
  }

  return value as string;
}

/**
 * Get spacing value
 * @example getSpacing('md') // '1rem'
 */
export function getSpacing(size: keyof typeof theme.spacing): string {
  return theme.spacing[size];
}

/**
 * Get shadow value
 * @example getShadow('medium') // '0 4px 6px -1px rgba(0, 0, 0, 0.1)...'
 */
export function getShadow(size: keyof typeof theme.shadows): string {
  return theme.shadows[size];
}

/**
 * Get border radius value
 * @example getBorderRadius('md') // '0.5rem'
 */
export function getBorderRadius(size: keyof typeof theme.borderRadius): string {
  return theme.borderRadius[size];
}

/**
 * Generate CSS class for status color
 * @example getStatusColorClass('error') // 'text-status-error'
 */
export function getStatusColorClass(status: 'error' | 'success' | 'warning' | 'info'): string {
  return `text-status-${status}`;
}

/**
 * Generate CSS class for status background color
 * @example getStatusBgClass('error') // 'bg-status-error'
 */
export function getStatusBgClass(status: 'error' | 'success' | 'warning' | 'info'): string {
  return `bg-status-${status}`;
}

/**
 * Convert milliseconds to CSS transition duration
 * @example getTransitionDuration('normal') // '300ms'
 */
export function getTransitionDuration(speed: keyof typeof theme.animations): string {
  return `${theme.animations[speed]}ms`;
}

/**
 * Check if viewport matches breakpoint
 * @example isBreakpoint('md') // true/false
 */
export function isBreakpoint(breakpoint: keyof typeof theme.breakpoints): boolean {
  if (typeof window === 'undefined') return false;
  const width = parseInt(theme.breakpoints[breakpoint]);
  return window.innerWidth >= width;
}

/**
 * Generate responsive class names based on breakpoints
 * @example getResponsiveClasses({ base: 'text-sm', md: 'text-base', lg: 'text-lg' })
 * // Returns: 'text-sm md:text-base lg:text-lg'
 */
export function getResponsiveClasses(
  classes: Partial<Record<'base' | keyof typeof theme.breakpoints, string>>
): string {
  const { base, ...breakpointClasses } = classes;
  const classNames: string[] = base ? [base] : [];

  for (const [breakpoint, className] of Object.entries(breakpointClasses)) {
    if (className) {
      classNames.push(`${breakpoint}:${className}`);
    }
  }

  return classNames.join(' ');
}

/**
 * Combine multiple class names, filtering out falsy values
 * @example cn('text-primary', someCondition && 'font-bold', 'text-lg')
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get z-index value
 * @example getZIndex('modal') // 1400
 */
export function getZIndex(layer: keyof typeof theme.zIndex): number {
  return theme.zIndex[layer];
}

/**
 * Create CSS custom property name
 * @example getCSSVar('primary') // '--color-primary'
 */
export function getCSSVar(name: string, prefix = 'color'): string {
  return `--${prefix}-${name}`;
}

/**
 * Export theme for use in styled components or CSS-in-JS
 */
export { theme };
