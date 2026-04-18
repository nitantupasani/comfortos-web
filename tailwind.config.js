/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef7f2', 100: '#d5ece0', 200: '#a8d9c0', 300: '#70c1b3', 400: '#4da88a', 500: '#36805c', 600: '#2d6b4d', 700: '#245740', 800: '#1c4433', 900: '#153528' },
        comfort: { cold3: '#1565C0', cold2: '#42A5F5', cold1: '#90CAF9', neutral: '#66BB6A', warm1: '#FFB74D', warm2: '#FF7043', warm3: '#D32F2F' },
      },
    },
  },
  plugins: [],
};
