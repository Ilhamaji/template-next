import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", ".agents/**", ".hermes/**"],
  },
  resolve: {
    alias: {
      // Mirrors the "@/*" path alias from tsconfig.json
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
