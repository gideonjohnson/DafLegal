/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand colors - Green Leather & Gold
        leather: {
          dark: '#1a2e1a',
          main: '#234023',
          mid: '#2d5a2d',
          light: '#3d6b3d',
          highlight: '#4a7c4a',
        },
        beige: {
          dark: '#b8965a',
          main: '#e8d5b7',
          light: '#f5edd8',
          cream: '#faf7f0',
        },
        gold: {
          main: '#d4a561',
          light: '#e8b977',
        },
        // Keep primary for compatibility
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      // Touch target sizing utilities
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      // Animation utilities
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      // Custom shadows
      boxShadow: {
        'leather': '0 20px 60px rgba(26, 46, 26, 0.5), 0 8px 24px rgba(0, 0, 0, 0.3)',
        'gold': '0 4px 20px rgba(184, 150, 90, 0.3)',
        'card': '0 10px 40px rgba(26, 46, 26, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 20px 60px rgba(26, 46, 26, 0.3), 0 8px 20px rgba(0, 0, 0, 0.15)',
      },
      // Typography
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      // Spacing for mobile-friendly layouts
      spacing: {
        'safe': '8px',
        'touch': '12px',
      },
    },
  },
  plugins: [],
}
