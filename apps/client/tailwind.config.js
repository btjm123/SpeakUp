/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.55' },
          '100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.045)' },
        },
        'eq-bar': {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
        breathe: 'breathe 3s ease-in-out infinite',
        'eq-bar': 'eq-bar 1s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out',
      },
    },
  },
  plugins: [],
};
