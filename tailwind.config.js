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
        'fade-in': `fadeIn ${designTokens.animations.duration.normal} ${designTokens.animations.timing.easeOut}`,
        'fade-in-up': `fadeInUp ${designTokens.animations.duration.slow} ${designTokens.animations.timing.easeOut} forwards`,
        'slide-up': `slideUp ${designTokens.animations.duration.slow} ${designTokens.animations.timing.easeOut}`,
        'slide-in-right': `slideInRight ${designTokens.animations.duration.normal} ${designTokens.animations.timing.easeOut}`,
        'scale-in': `scaleIn ${designTokens.animations.duration.fast} ${designTokens.animations.timing.easeOut}`,
      },
      keyframes: designTokens.animations.keyframes,
      animationDelay: designTokens.animations.delay,
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}


