const ACTIVE_CONTENT_TYPES = new Set([
  "image/svg+xml",
  "text/html",
  "application/xhtml+xml",
  "text/xml",
  "application/xml",
])

const isActiveContentType = (contentType: string) => {
  const normalized = contentType.toLowerCase().split(";")[0]?.trim() ?? ""
  if (!normalized) return false
  if (ACTIVE_CONTENT_TYPES.has(normalized)) return true
  return normalized.endsWith("+xml")
}

/**
 * Security headers for upload proxy responses.
 *
 * These proxies stream S3 objects from the app's own origin, and the stored
 * Content-Type is client-declared (spoofable). Defense-in-depth:
 * - `nosniff` stops the browser from re-interpreting bytes as a more
 *   dangerous type than declared.
 * - `attachment` on active types (SVG/HTML/XML) forces a download instead of
 *   inline rendering, neutralizing stored-XSS even for pre-existing uploads.
 */
export const getUploadServeHeaders = (contentType: string) => {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
  }

  if (isActiveContentType(contentType)) {
    headers["Content-Disposition"] = "attachment"
  }

  return headers
}
