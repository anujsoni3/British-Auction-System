/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          bg: '#040914',
          surface: '#0A1222',
          surfaceHover: '#111A2E',
          accent: '#00E676', // neon green
          accentHover: '#00C853',
          muted: '#64748B',
          text: '#F8FAFC',
        },
        'emerald': {
          '50': '#f0fdf4',
          '100': '#dcfce7',
          '200': '#bbf7d0',
          '300': '#86efac',
          '400': '#4ade80',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
          '800': '#166534',
          '900': '#145231',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'premium-glow': 'radial-gradient(circle at top right, rgba(0, 230, 118, 0.08), transparent 40%)',
        'premium-glow-center': 'radial-gradient(circle at 50% 0%, rgba(0, 230, 118, 0.15), transparent 60%)',
      },
      boxShadow: {
        'emerald-glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        'emerald-glow-lg': '0 0 40px rgba(34, 197, 94, 0.4)',
        'neon-sm': '0 0 10px rgba(0, 230, 118, 0.3)',
        'neon-md': '0 0 20px rgba(0, 230, 118, 0.4)',
        'neon-border': 'inset 0 0 0 1px rgba(0, 230, 118, 0.5)',
        'surface': '0 4px 20px rgba(0,0,0,0.4)',
        'surface-hover': '0 10px 30px rgba(0,0,0,0.6)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' },
        },
      },
      fontFamily: {
        'sans': ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [],
}
