/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        nexora: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          DEFAULT: '#2563EB',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          DEFAULT: '#2563EB',
        },
        mint: {
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          DEFAULT: '#34D399',
        },
        civic: {
          950: '#07100A',
          900: '#0B1710',
          850: '#102217',
          800: '#162C1E',
          700: '#1F3F2C',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-mint': '0 0 25px -5px rgba(52, 211, 153, 0.4)',
        'glow-indigo': '0 0 30px -5px rgba(99, 102, 241, 0.35)',
        'flowora': '0 20px 40px -15px rgba(79, 70, 229, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        'flowora-lg': '0 25px 50px -12px rgba(79, 70, 229, 0.15)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};
