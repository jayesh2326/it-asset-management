/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe0e4",
          200: "#ffc2ca",
          300: "#ff95a0",
          400: "#ff6877",
          500: "#e3182d",
          600: "#c1121f",
          700: "#9d0f1a",
          800: "#7f0d16",
          900: "#53080f"
        },
        sand: "#151515",
        ink: "#050505"
      },
      boxShadow: {
        panel: "0 20px 45px rgba(15, 23, 42, 0.08)"
      },
      fontFamily: {
        sans: ["'Segoe UI'", "Tahoma", "Geneva", "Verdana", "sans-serif"]
      }
    }
  },
  plugins: []
};
