/**
 * Theme Constants
 *
 * EarthEnable design system constants matching the React Native mobile app.
 * These values should remain consistent across web and mobile platforms.
 */

/**
 * Brand Colors
 */
export const colors = {
  // Primary brand colors
  primary: '#EA6A00',      // Orange
  secondary: '#78373B',    // Dark red/brown
  accent: '#D5A34C',       // Gold
  green: '#124D37',        // Dark green
  blue: '#3E57AB',         // Blue

  // Background colors
  background: {
    primary: '#F7EDDB',    // Cream
    white: '#FFFFFF',
    light: '#FDFCFC',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: '#1F2937',    // Dark gray
    secondary: '#6B7280',  // Medium gray
    disabled: '#9CA3AF',   // Light gray
    inverse: '#FFFFFF',    // White text on dark backgrounds
  },

  // Status/feedback colors
  status: {
    error: '#E04562',
    success: '#124D37',
    warning: '#D5A34C',
    info: '#3E57AB',
  },

  // Border colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
} as const;

/**
 * Typography
 */
export const typography = {
  fonts: {
    heading: '"Ropa Sans", sans-serif',
    body: '"Lato", sans-serif',
    flourish: '"Literata", serif',
  },

  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Spacing
 * Base unit: 4px
 */
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

/**
 * Border Radius
 */
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',  // Full rounded
} as const;

/**
 * Shadows
 */
export const shadows = {
  small: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  large: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

/**
 * Z-Index Layers
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

/**
 * Theme object containing all constants
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  animations,
} as const;

export type Theme = typeof theme;
