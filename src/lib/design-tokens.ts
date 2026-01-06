/**
 * Fly-Fleet Design System - Single Source of Truth
 *
 * This file contains all design tokens used across the application.
 * Import these values instead of using hardcoded colors/sizes.
 *
 * @see DESIGN_SYSTEM.md for full documentation
 */

export const colors = {
  // Primary Brand Colors
  navy: {
    primary: '#13213d',  // Main brand color
    50: '#f0f4f8',
    100: '#d9e2ec',
    200: '#bcccdc',
    300: '#9fb3c8',
    400: '#829ab1',
    500: '#627d98',
    600: '#486581',
    700: '#334e68',
    800: '#243b53',
    900: '#13213d',
    950: '#0b1621',
  },

  // Accent Colors
  blue: {
    accent: '#2F6AEF',
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2F6AEF',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral Colors
  neutral: {
    light: '#F4F6F8',
    medium: '#828FA0',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Base Colors
  white: '#FFFFFF',
  black: '#000000',

  // Semantic Colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#047857',
  },
  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#dc2626',
  },
  warning: {
    light: '#fed7aa',
    DEFAULT: '#f59e0b',
    dark: '#d97706',
  },
  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#2563eb',
  },
};

export const fontSize = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
};

export const fontWeight = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

export const spacing = {
  section: {
    xs: '2rem',   // 32px - Compact sections
    sm: '3rem',   // 48px - Small sections
    md: '4rem',   // 64px - Medium sections
    lg: '5rem',   // 80px - Large sections
    xl: '6rem',   // 96px - Extra large sections
    '2xl': '8rem', // 128px - Hero sections
  },
  component: {
    xs: '0.5rem',  // 8px
    sm: '0.75rem', // 12px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
  },
  gap: {
    xs: '0.5rem',  // 8px
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
    xl: '3rem',    // 48px
  },
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  soft: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  medium: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  large: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  xl: '0 35px 60px -15px rgb(0 0 0 / 0.3)',
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

export const animations = {
  // Animation keyframes
  keyframes: {
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
    },
    slideUp: {
      from: {
        opacity: '0',
        transform: 'translateY(20px)',
      },
      to: {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
    fadeInUp: {
      from: {
        opacity: '0',
        transform: 'translateY(2rem)',
      },
      to: {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
    slideInRight: {
      from: {
        opacity: '0',
        transform: 'translateX(-20px)',
      },
      to: {
        opacity: '1',
        transform: 'translateX(0)',
      },
    },
    scaleIn: {
      from: {
        opacity: '0',
        transform: 'scale(0.95)',
      },
      to: {
        opacity: '1',
        transform: 'scale(1)',
      },
    },
  },
  // Animation durations
  duration: {
    fast: '300ms',
    normal: '600ms',
    slow: '800ms',
    slower: '1000ms',
  },
  // Animation delays
  delay: {
    none: '0ms',
    short: '200ms',
    medium: '400ms',
    long: '600ms',
  },
  // Animation timings
  timing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
  },
};

// Export individual token categories for easier importing
export default {
  colors,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  animations,
};
