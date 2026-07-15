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
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 4px 16px rgba(11,18,32,0.06)',
        'card-hover': '0 2px 4px rgba(11,18,32,0.06), 0 12px 28px rgba(11,18,32,0.10)',
        glow: '0 8px 30px rgba(11,61,145,0.25)',
      },
    },
  },
  plugins: [],
};