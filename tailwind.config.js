/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070A0F',
          900: '#0B1018',
          850: '#0F1622',
          800: '#141C2A',
          700: '#1B2536',
          600: '#283246',
          500: '#3A4660',
        },
        neon: {
          DEFAULT: '#22D3EE',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(34,211,238,0.25), 0 12px 40px -12px rgba(34,211,238,0.35)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at top, rgba(34,211,238,0.08), transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 2.4s ease-in-out infinite',
        'fade-in': 'fadeIn .18s ease-out',
        'slide-in-right': 'slideInRight .25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
