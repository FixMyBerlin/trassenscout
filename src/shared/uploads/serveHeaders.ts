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
 *
 * `forceDownload` additionally forces `attachment` for previewable types
 * (PDF, images) so an explicit "Download" action downloads the file instead of
 * opening it inline in the browser. When a `filename` is given the browser uses
 * it as the suggested download name.
 */
export const getUploadServeHeaders = (
  contentType: string,
  options: { forceDownload?: boolean; filename?: string } = {},
) => {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
  }

  if (options.forceDownload || isActiveContentType(contentType)) {
    headers["Content-Disposition"] = buildContentDisposition(options.filename)
  }

  return headers
}

const buildContentDisposition = (filename?: string) => {
  if (!filename) return "attachment"

  const asciiFallback = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_")
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeRFC5987(filename)}`
}

/**
 * Percent-encodes a string for the RFC 5987 `filename*` parameter. Beyond
 * `encodeURIComponent`, it also escapes `'`, `(`, `)`, and `*` (which are not
 * valid attr-chars) so the UTF-8 filename parses reliably across browsers.
 */
const encodeRFC5987 = (value: string) =>
  encodeURIComponent(value).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
