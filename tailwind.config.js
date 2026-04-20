/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' },
        comfort: { cold3: '#1565C0', cold2: '#42A5F5', cold1: '#90CAF9', neutral: '#66BB6A', warm1: '#FFB74D', warm2: '#FF7043', warm3: '#D32F2F' },
      },
    },
  },
  plugins: [],
};
