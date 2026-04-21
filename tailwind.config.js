/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#dbe7ff",
          200: "#b6ceff",
          300: "#7da7ff",
          400: "#4d7fff",
          500: "#275eea",
          600: "#1748c2",
          700: "#12389a",
          800: "#122f7a",
          900: "#14295f"
        },
        sand: "#f7f4ee",
        ink: "#0f172a"
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
