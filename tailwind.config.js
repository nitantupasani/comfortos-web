/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a' },
        comfort: { cold3: '#1565C0', cold2: '#42A5F5', cold1: '#90CAF9', neutral: '#66BB6A', warm1: '#FFB74D', warm2: '#FF7043', warm3: '#D32F2F' },
      },
    },
  },
  plugins: [],
};
