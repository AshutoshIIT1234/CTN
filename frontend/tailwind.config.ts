import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ── Dynamic Viewport Height (100dvh) ─────────────── */
      height: {
        'screen-dvh': '100dvh',
        'screen-svh': '100svh',
        'screen-lvh': '100lvh',
      },
      minHeight: {
        'screen-dvh': '100dvh',
        'screen-svh': '100svh',
        'screen-lvh': '100lvh',
      },
      maxHeight: {
        'screen-dvh': '100dvh',
        'screen-svh': '100svh',
        'screen-lvh': '100lvh',
      },
      /* ── Safe-area spacing tokens ─────────────────────── */
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
        /* Bottom nav height + safe-area for page padding  */
        'nav-bottom': 'calc(80px + env(safe-area-inset-bottom, 0px))',
      },
      colors: {
        // CTN Premium Intellectual Color System
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Electric Indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        royal: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Royal Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        navy: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1220',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0b1220',
        },
        border: 'rgb(var(--border))',
        input: 'rgb(var(--input))',
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-navy': 'linear-gradient(135deg, #0b1220 0%, #111827 100%)',
        'gradient-royal': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'luxury': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'luxury-lg': '0 10px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
      /* ── Screens: add xs for very small phones ─────────── */
      screens: {
        xs: '375px',
      },
      /* ── Line-clamp (for truncated text in cards) ──────── */
      lineClamp: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
      },
    },
  },
  plugins: [
    /* ── Safe-area inset utilities ──────────────────────── */
    plugin(function ({ addUtilities, theme }) {
      addUtilities({
        /* Padding helpers */
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top, 0px)' },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom, 0px)' },
        '.pl-safe': { paddingLeft: 'env(safe-area-inset-left, 0px)' },
        '.pr-safe': { paddingRight: 'env(safe-area-inset-right, 0px)' },
        '.px-safe': {
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        },
        '.py-safe': {
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        },
        /* Margin helpers */
        '.mt-safe': { marginTop: 'env(safe-area-inset-top, 0px)' },
        '.mb-safe': { marginBottom: 'env(safe-area-inset-bottom, 0px)' },
        /* Bottom-nav page padding (nav height + safe-area) */
        '.pb-nav': {
          paddingBottom:
            'calc(80px + env(safe-area-inset-bottom, 0px) + 0.5rem)',
        },
        '.mb-nav': {
          marginBottom:
            'calc(80px + env(safe-area-inset-bottom, 0px))',
        },
        /* Minimum tap-target size (Apple HIG: 44×44 pt) */
        '.tap-target': {
          minWidth: '44px',
          minHeight: '44px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        /* Prevent blue flash on tap */
        '.no-tap-highlight': {
          WebkitTapHighlightColor: 'transparent',
        },
        /* Momentum scroll in container */
        '.scroll-momentum': {
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        },
        /* Prevent text selection on UI controls */
        '.no-select': {
          userSelect: 'none',
          WebkitUserSelect: 'none',
        },
        /* Full dynamic viewport height */
        '.h-dvh': { height: '100dvh' },
        '.min-h-dvh': { minHeight: '100dvh' },
        '.max-h-dvh': { maxHeight: '100dvh' },
        /* Scrollbar hide */
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        /* Safe full-height for iOS bottom bar */
        '.h-screen-safe': {
          height:
            'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        },
      })
    }),

    /* ── Line-clamp utility (Tailwind v3 built-in, but explicit for v2 compat) */
    plugin(function ({ addUtilities }) {
      const lineClampUtils: Record<string, Record<string, string>> = {}
      for (let i = 1; i <= 6; i++) {
        lineClampUtils[`.line-clamp-${i}`] = {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': String(i),
        }
      }
      lineClampUtils['.line-clamp-none'] = {
        overflow: 'visible',
        display: 'block',
        '-webkit-box-orient': 'horizontal',
        '-webkit-line-clamp': 'unset',
      }
      addUtilities(lineClampUtils)
    }),
  ],
  darkMode: 'class',
}

export default config
