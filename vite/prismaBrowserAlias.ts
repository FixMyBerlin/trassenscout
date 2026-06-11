import { fileURLToPath, URL } from "node:url"
import type { Plugin } from "vite"

const prismaBrowserEntry = fileURLToPath(
  new URL("../src/prisma/generated/browser.ts", import.meta.url),
)

/**
 * Shared server Zod schemas import `@/src/prisma/generated/client` for enums.
 * Redirect to the browser entry in client bundles so PrismaClient never ships to
 * the browser.
 */
export function prismaBrowserAlias(): Plugin {
  const serverEntry = "@/src/prisma/generated/client"

  return {
    name: "prisma-browser-alias",
    enforce: "pre",
    resolveId(source, _importer, options) {
      if (options?.ssr) return null
      if (
        source === serverEntry ||
        source.endsWith("/prisma/generated/client") ||
        source.endsWith("/prisma/generated/client.ts")
      ) {
        return prismaBrowserEntry
      }
      return null
    },
  }
}
