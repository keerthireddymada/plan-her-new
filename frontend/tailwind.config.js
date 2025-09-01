/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#faf9fc',
          100: '#f3f1f8',
          200: '#e9e5f0',
          300: '#d8d0e3',
          400: '#c2b2d1',
          500: '#a891bd',
          600: '#9073a6',
          700: '#7a5e8b',
          800: '#654f73',
          900: '#54445f',
        },
        black: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#c0c0c0',
          300: '#a0a0a0',
          400: '#808080',
          500: '#606060',
          600: '#404040',
          700: '#202020',
          800: '#101010',
          900: '#080808',
          950: '#000000',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Lora', 'serif'],
      },
      boxShadow: {
        'lavender': '0 4px 14px 0 rgba(168, 145, 189, 0.25)',
        'glow': '0 0 20px rgba(168, 145, 189, 0.3)',
      }
    },
  },
  plugins: [],
};
