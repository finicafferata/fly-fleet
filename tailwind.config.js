/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fly-Fleet Design System Colors
        'navy-primary': '#13213d',
        'neutral-light': '#F4F6F8',
        'neutral-medium': '#828FA0',
        'accent-blue': '#2F6AEF',
        'white': '#FFFFFF',
        'black': '#000000',
        // Legacy aliases
        'navy': '#13213d',
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['Soul Gaze BC', 'Poppins', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'medium': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'large': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
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


