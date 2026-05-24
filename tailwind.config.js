import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      opacity: {
        '4': '0.04',
        '6': '0.06',
        '8': '0.08',
        '12': '0.12',
        '15': '0.15',
        '18': '0.18',
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand
        primary: {
          DEFAULT: '#014B52',
          50: '#E6F0F1',
          100: '#CCE1E3',
          200: '#99C3C7',
          300: '#66A5AB',
          400: '#33878F',
          500: '#01696F',
          600: '#014B52',
          700: '#013D43',
          800: '#012F33',
          900: '#012124',
        },
        accent: {
          DEFAULT: '#F5A800',
          50: '#FEF6E5',
          100: '#FDECC0',
          200: '#FBD881',
          300: '#F9C541',
          400: '#F5A800',
          500: '#D89400',
          600: '#B17800',
          700: '#8A5C00',
        },
        // Surfaces (warm cream palette from demo)
        surface: {
          DEFAULT: '#FBFAF7',
          base: '#F6F4EF',
          raised: '#FBFAF7',
          sunken: '#F2EFE9',
          offset: '#EBE7DF',
        },
        ink: {
          DEFAULT: '#28251D',
          muted: '#6C665D',
          faint: '#9A938B',
          inverse: '#F9F8F4',
        },
        line: {
          DEFAULT: 'rgba(40, 37, 29, 0.11)',
          strong: 'rgba(40, 37, 29, 0.18)',
          divider: '#D9D3CB',
        },
        // Semantic
        success: '#437A22',
        info: '#006494',
        warning: '#DA7101',
        danger: '#B42318',
        purple: '#7A39BB',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.875rem',
        lg: '1.125rem',
        xl: '1.5rem',
        '2xl': '1.8rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(40,37,29,.05), 0 8px 22px rgba(40,37,29,.03)',
        medium: '0 8px 20px rgba(40,37,29,.08), 0 20px 56px rgba(40,37,29,.06)',
        large: '0 16px 28px rgba(40,37,29,.12), 0 26px 72px rgba(40,37,29,.08)',
        ring: '0 0 0 4px rgba(1, 75, 82, 0.10)',
        'ring-accent': '0 0 0 4px rgba(245, 168, 0, 0.18)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 380ms cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slide-in-right 320ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};