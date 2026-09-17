import { z } from "zod"

/** Back-link URL passed through admin CRUD flows (`ConditionalBackLink`). */
export const fromBackLinkSearchSchema = z.object({
  from: z.string().optional(),
})

/** Reduced to an in-app path: an absolute URL keeps only its path, `//host` is rejected. */
export function internalFromPath(value: unknown) {
  if (typeof value !== "string" || !value) return undefined

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value)
      return `${url.pathname}${url.search}${url.hash}`
    } catch {
      return undefined
    }
  }

  if (value.startsWith("//")) return undefined

  return value.startsWith("/") ? value : `/${value}`
}
