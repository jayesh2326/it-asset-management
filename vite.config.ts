import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  envPrefix: ["NEXT_PUBLIC_"],
  plugins: [react()],
  server: {
    port: 5173
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    globals: true,
    include: ["src/tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**"]
  }
});
