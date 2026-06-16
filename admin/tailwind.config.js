/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: "#0F172A",
          600: "#2563EB",
          500: "#3B82F6",
          100: "#DBEAFE",
        },
        secondary: {
          600: "#7C3AED",
          500: "#8B5CF6",
        },
      },
    },
  },
  plugins: [],
}
