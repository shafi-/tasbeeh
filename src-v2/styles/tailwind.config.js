/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src-v2/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Semantic Color System (Material Design 3 inspired)
      colors: {
        // Primary (Forest Green)
        primary: '#012d1d',
        'primary-container': '#1b4332',
        'on-primary': '#ffffff',
        'on-primary-container': '#86af99',
        'inverse-primary': '#a5d0b9',
        'primary-fixed': '#c1ecd4',
        'primary-fixed-dim': '#a5d0b9',

        // Secondary (Sage/Olive)
        secondary: '#5e5f56',
        'secondary-container': '#e4e3d7',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#64655c',
        'secondary-fixed': '#e4e3d7',
        'secondary-fixed-dim': '#c7c7bc',
        'on-secondary-fixed': '#1b1c15',
        'on-secondary-fixed-variant': '#46473f',

        // Tertiary (Gold/Amber)
        tertiary: '#735c00',
        'tertiary-container': '#cba72f',
        'tertiary-fixed': '#ffe088',
        'tertiary-fixed-dim': '#e9c349',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#4e3d00',
        'on-tertiary-fixed': '#241a00',
        'on-tertiary-fixed-variant': '#574500',

        // Surfaces
        surface: '#fcf9f8',
        'surface-container': '#f0eded',
        'surface-container-low': '#f6f3f2',
        'surface-container-high': '#eae7e7',
        'surface-container-highest': '#e4e2e1',
        'surface-container-lowest': '#ffffff',
        'surface-dim': '#dcd9d9',
        'surface-bright': '#fcf9f8',
        'surface-variant': '#e4e2e1',
        'surface-tint': '#3f6653',

        // Text
        'on-surface': '#1b1c1c',
        'on-surface-variant': '#414844',
        'on-background': '#1b1c1c',

        // Outlines
        outline: '#717973',
        'outline-variant': '#c1c8c2',

        // Error
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Inverse surfaces (dark mode)
        'inverse-surface': '#303030',
        'inverse-on-surface': '#f3f0f0',

        // Surface brightness (for dark mode)
        'surface-bright': '#fcf9f8',
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
        'headline-lg-mobile': ['Plus Jakarta Sans', 'sans-serif'],
        'headline-lg': ['Plus Jakarta Sans', 'sans-serif'],
        'headline-md': ['Plus Jakarta Sans', 'sans-serif'],
        'body-lg': ['"Source Sans 3"', 'sans-serif'],
        'body-md': ['"Source Sans 3"', 'sans-serif'],
        'caption': ['"Source Sans 3"', 'sans-serif'],
        'display-arabic': ['Noto Serif', 'serif'],
        'label-md': ['Plus Jakarta Sans', 'sans-serif'],
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
    },
  },
  plugins: [],
};
