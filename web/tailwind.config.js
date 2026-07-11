// web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0B3D91',
        'brand-blue-dark': '#062658',
        'brand-green': '#1F9D55',
        'brand-green-dark': '#146638',
        ink: '#0B1220',
        paper: '#FBFCFE',
        amber: '#F08C00',
        slate: {
          500: '#64748B',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};