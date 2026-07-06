/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand: soft emerald → forest green ──────────────────────────
        brand: {
          50: '#ECFBF3',
          100: '#D2F5E3',
          200: '#A8ECC9',
          300: '#6FDDA9',
          400: '#34C88A',
          500: '#0FA574', // primary
          600: '#0B8A61',
          700: '#0A6E4E',
          800: '#0B573F',
          900: '#0A4735',
          DEFAULT: '#0FA574',
        },
        // ── Sage: muted botanical green (secondary surfaces/labels) ─────
        sage: {
          50: '#F1F5F2',
          100: '#E2EBE5',
          200: '#C6D8CC',
          300: '#A9C4B2',
          400: '#8AAE97',
          500: '#6E9A7E',
          600: '#567E64',
          700: '#45644F',
          800: '#37503F',
          900: '#2C4033',
        },
        // ── Cream / sand: warm neutral backgrounds ──────────────────────
        cream: {
          50: '#FEFCF8',
          100: '#FBF7EF',
          200: '#F5EEE1',
          300: '#ECE0CC',
          400: '#DFCDAF',
        },
        // ── Coral: warm accent (CTAs, highlights) ───────────────────────
        coral: {
          50: '#FFF1EC',
          100: '#FFE0D5',
          200: '#FFC2AD',
          300: '#FF9E7E',
          400: '#FF7A59', // accent
          500: '#F65E3B',
          600: '#DB4426',
          DEFAULT: '#FF7A59',
        },
        // ── Gold: soft premium highlight ────────────────────────────────
        gold: {
          300: '#F1D488',
          400: '#E7B94F',
          500: '#D9A62F',
          DEFAULT: '#E7B94F',
        },
        // ── Semantic tokens (theme-switchable via CSS vars) ─────────────
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-subtle': 'rgb(var(--ink-subtle) / <alpha-value>)',
        // status
        success: '#16A34A',
        warning: '#E7A100',
        danger: '#E5484D',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,40,32,0.04), 0 8px 24px -14px rgba(16,40,32,0.14)',
        card: '0 1px 3px rgba(16,40,32,0.05), 0 14px 36px -18px rgba(16,40,32,0.20)',
        lift: '0 2px 6px rgba(16,40,32,0.06), 0 24px 60px -24px rgba(16,40,32,0.28)',
        glow: '0 0 0 1px rgba(15,165,116,0.14), 0 16px 48px -14px rgba(15,165,116,0.38)',
        'inner-soft': 'inset 0 1px 0 0 rgba(255,255,255,0.6)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #0FA574 0%, #0B7A5A 55%, #0A6E4E 100%)',
        'coral-gradient': 'linear-gradient(135deg, #FF9E7E 0%, #FF7A59 100%)',
        'sheen': 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 70%)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        'ring-fill': {
          '0%': { strokeDashoffset: 'var(--dash-start)' },
          '100%': { strokeDashoffset: 'var(--dash-end)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'slide-up': 'slide-up 0.35s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 1.6s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
