import { sanitizeKey } from "./keys"

/**
 * Returns a project-unique, S3-safe filename. When the sanitized name already
 * exists it appends "(n)" before the extension ("foto.png" → "foto(1).png").
 */
export function dedupeUploadFilename(rawFilename: string, takenLower: Set<string>): string {
  const sanitized = sanitizeKey(rawFilename)

  const claim = (name: string) => {
    takenLower.add(name.toLowerCase())
    return name
  }

  if (!takenLower.has(sanitized.toLowerCase())) return claim(sanitized)

  const dotIndex = sanitized.lastIndexOf(".")
  const base = dotIndex > 0 ? sanitized.slice(0, dotIndex) : sanitized
  const extension = dotIndex > 0 ? sanitized.slice(dotIndex) : ""

  let counter = 1
  let candidate = `${base}(${counter})${extension}`
  while (takenLower.has(candidate.toLowerCase())) {
    counter += 1
    candidate = `${base}(${counter})${extension}`
  }
  return claim(candidate)
}
