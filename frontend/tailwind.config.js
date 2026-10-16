/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ea580c", // Màu cam chủ đạo cho HungHuyTech
        secondary: "#1f2937",
      }
    },
  },
  plugins: [],
}