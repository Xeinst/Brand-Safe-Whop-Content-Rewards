/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        whop: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}
