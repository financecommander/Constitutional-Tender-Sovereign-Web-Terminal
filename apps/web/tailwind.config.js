/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf8ef',
          100: '#faefd5',
          200: '#f4dbaa',
          300: '#edc274',
          400: '#e5a33c',
          500: '#de8b1a',
          600: '#cf7112',
          700: '#ac5612',
          800: '#8a4416',
          900: '#723915',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
      },
    },
  },
  plugins: [],
};
