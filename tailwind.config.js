/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      maxWidth: {
        'mobile-container': '640px'
      },

      // "Noor" design system - Material Design 3 semantic tokens.
      // Values are CSS variables defined in src/index.css; the .dark class
      // swaps every token, so dark mode works without per-class overrides.
      colors: {
        // Primary (Deep Emerald)
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--color-primary-container) / <alpha-value>)',
        'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--color-on-primary-container) / <alpha-value>)',
        'inverse-primary': 'rgb(var(--color-inverse-primary) / <alpha-value>)',
        'primary-fixed': 'rgb(var(--color-primary-fixed) / <alpha-value>)',
        'primary-fixed-dim': 'rgb(var(--color-primary-fixed-dim) / <alpha-value>)',

        // Secondary (Sage/Olive)
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'secondary-container': 'rgb(var(--color-secondary-container) / <alpha-value>)',
        'on-secondary': 'rgb(var(--color-on-secondary) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--color-on-secondary-container) / <alpha-value>)',
        'secondary-fixed': 'rgb(var(--color-secondary-fixed) / <alpha-value>)',
        'secondary-fixed-dim': 'rgb(var(--color-secondary-fixed-dim) / <alpha-value>)',
        'on-secondary-fixed': 'rgb(var(--color-on-secondary-fixed) / <alpha-value>)',
        'on-secondary-fixed-variant': 'rgb(var(--color-on-secondary-fixed-variant) / <alpha-value>)',

        // Tertiary (Gold)
        tertiary: 'rgb(var(--color-tertiary) / <alpha-value>)',
        'tertiary-container': 'rgb(var(--color-tertiary-container) / <alpha-value>)',
        'tertiary-fixed': 'rgb(var(--color-tertiary-fixed) / <alpha-value>)',
        'tertiary-fixed-dim': 'rgb(var(--color-tertiary-fixed-dim) / <alpha-value>)',
        'on-tertiary': 'rgb(var(--color-on-tertiary) / <alpha-value>)',
        'on-tertiary-container': 'rgb(var(--color-on-tertiary-container) / <alpha-value>)',
        'on-tertiary-fixed': 'rgb(var(--color-on-tertiary-fixed) / <alpha-value>)',
        'on-tertiary-fixed-variant': 'rgb(var(--color-on-tertiary-fixed-variant) / <alpha-value>)',

        // Surfaces (warm parchment in light, deep green-black in dark)
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-container': 'rgb(var(--color-surface-container) / <alpha-value>)',
        'surface-container-low': 'rgb(var(--color-surface-container-low) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--color-surface-container-high) / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--color-surface-container-highest) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--color-surface-container-lowest) / <alpha-value>)',
        'surface-dim': 'rgb(var(--color-surface-dim) / <alpha-value>)',
        'surface-bright': 'rgb(var(--color-surface-bright) / <alpha-value>)',
        'surface-variant': 'rgb(var(--color-surface-variant) / <alpha-value>)',
        'surface-tint': 'rgb(var(--color-surface-tint) / <alpha-value>)',

        // Text
        'on-surface': 'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'on-background': 'rgb(var(--color-on-background) / <alpha-value>)',

        // Outlines
        outline: 'rgb(var(--color-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--color-outline-variant) / <alpha-value>)',

        // Error
        error: 'rgb(var(--color-error) / <alpha-value>)',
        'on-error': 'rgb(var(--color-on-error) / <alpha-value>)',
        'error-container': 'rgb(var(--color-error-container) / <alpha-value>)',
        'on-error-container': 'rgb(var(--color-on-error-container) / <alpha-value>)',

        // Inverse surfaces
        'inverse-surface': 'rgb(var(--color-inverse-surface) / <alpha-value>)',
        'inverse-on-surface': 'rgb(var(--color-inverse-on-surface) / <alpha-value>)',
      },

      // Border Radius
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        'full': '9999px',
      },

      // Spacing
      spacing: {
        'container-padding-desktop': '64px',
        'unit': '8px',
        'touch-target-min': '56px',
        'container-padding-mobile': '24px',
        'gutter': '16px',
      },

      // Font Families
      fontFamily: {
        'headline-lg-mobile': ['Plus Jakarta Sans', 'Noto Sans Bengali', 'sans-serif'],
        'headline-lg': ['Plus Jakarta Sans', 'Noto Sans Bengali', 'sans-serif'],
        'headline-md': ['Plus Jakarta Sans', 'Noto Sans Bengali', 'sans-serif'],
        'body-lg': ['"Source Sans 3"', 'Noto Sans Bengali', 'sans-serif'],
        'body-md': ['"Source Sans 3"', 'Noto Sans Bengali', 'sans-serif'],
        'caption': ['"Source Sans 3"', 'Noto Sans Bengali', 'sans-serif'],
        'display-arabic': ['Amiri', 'Noto Serif', 'serif'],
        'label-md': ['Plus Jakarta Sans', 'Noto Sans Bengali', 'sans-serif'],
      },

      // Font Sizes
      fontSize: {
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'body-lg': ['20px', { lineHeight: '30px', fontWeight: '400' }],
        'display-arabic': ['48px', { lineHeight: '72px', fontWeight: '500' }],
        'label-md': ['16px', { lineHeight: '24px', letterSpacing: '0.02em', fontWeight: '600' }],
        'body-md': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'caption': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },

      // Elevation
      boxShadow: {
        'card': '0 4px 20px rgba(27, 28, 24, 0.05)',
        'card-lifted': '0 8px 32px rgba(27, 28, 24, 0.10)',
        'gold-glow': '0 0 24px rgba(201, 162, 39, 0.35)',
      },

      // Animation
      animation: {
        'ripple': 'ripple 0.6s linear',
        'scale-down': 'scaleDown 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-up': 'scaleUp 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      },

      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        scaleDown: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
        },
        scaleUp: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    }
  },
  plugins: []
};
