import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import { loadEnv } from "vite"
import { defineConfig } from "vitest/config"

const repoRootPath = fileURLToPath(new URL(".", import.meta.url))
const testEnv = loadEnv("test", repoRootPath, "")

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Keep in sync with `vite.config.ts` so tests resolve the same `@/...` imports.
      {
        find: "@",
        replacement: repoRootPath,
      },
    ],
  },
  test: {
    dir: "./",
    env: testEnv,
    globals: true,
    setupFiles: "./tests/setup.ts",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
    maxWorkers: 1,
  },
})
