import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: { 300: '#f9d976', 400: '#f0b429', 500: '#d97706', 600: '#b45309' },
        ruby: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        sapphire: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
        emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
        topaz: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        obsidian: { 800: '#1e1b2e', 900: '#13111f', 950: '#0a0812' },
        parchment: { 100: '#fef9ee', 200: '#fdf0cd', 300: '#fbe4a0' }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        crimson: ['Crimson Pro', 'serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f9d976, #f0b429, #d97706)',
      },
      boxShadow: {
        'gem-glow': '0 0 15px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'pulse-gold': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(240, 180, 41, 0.7)' },
          '50%': { opacity: '.8', boxShadow: '0 0 0 10px rgba(240, 180, 41, 0)' },
        },
        'dice-roll': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.2)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'token-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dice-roll': 'dice-roll 0.5s ease-in-out',
        'token-bounce': 'token-bounce 0.3s ease-in-out',
      }
    },
  },
  plugins: [],
} satisfies Config