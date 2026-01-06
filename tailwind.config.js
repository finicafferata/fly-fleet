/** @type {import('tailwindcss').Config} */
const designTokens = require('./src/lib/design-tokens.ts');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Import from design tokens - Single source of truth
        'navy-primary': designTokens.colors.navy.primary,
        'navy': designTokens.colors.navy,
        'blue': designTokens.colors.blue,
        'neutral-light': designTokens.colors.neutral.light,
        'neutral-medium': designTokens.colors.neutral.medium,
        'neutral': designTokens.colors.neutral,
        'accent-blue': designTokens.colors.blue.accent,
        'white': designTokens.colors.white,
        'black': designTokens.colors.black,
        // Semantic colors
        'success': designTokens.colors.success,
        'error': designTokens.colors.error,
        'warning': designTokens.colors.warning,
        'info': designTokens.colors.info,
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['Poppins', 'system-ui', 'sans-serif'], // Removed 'Soul Gaze BC' (not loaded)
      },
      fontSize: designTokens.fontSize,
      fontWeight: designTokens.fontWeight,
      lineHeight: designTokens.lineHeight,
      spacing: {
        ...designTokens.spacing.section,
        ...designTokens.spacing.component,
        ...designTokens.spacing.gap,
      },
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      transitionDuration: designTokens.transitions,
      zIndex: designTokens.zIndex,
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(2rem)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}


