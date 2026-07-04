import { defineConfig } from "vitest/config";

export default defineConfig({
  css: {
    preprocessorOptions: {
      sass: { api: "modern" },
      scss: { api: "modern" }
    }
  },
  test: {
    environment: "node",
    globals: true,
    include: ["**/*.test.ts", "**/*.test.tsx"]
  }
});
