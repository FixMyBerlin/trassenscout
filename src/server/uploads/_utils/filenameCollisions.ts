import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import { sanitizeKey } from "./keys"

/**
 * Returns the candidate filenames that collide with an already existing upload.
 * Compares case-insensitively against the immutable S3 filename (stored sanitized)
 * and the editable title (defaults to the original filename). Warn-only semantics,
 * so false positives are cheap.
 */
export function findCollidingFilenames(
  candidates: string[],
  existing: { externalUrl: string; title: string }[],
) {
  const existingNames = new Set(
    existing.flatMap((upload) => [
      getFilenameFromS3(upload.externalUrl).toLowerCase(),
      upload.title.toLowerCase(),
    ]),
  )

  return candidates.filter(
    (filename) =>
      existingNames.has(sanitizeKey(filename).toLowerCase()) ||
      existingNames.has(filename.toLowerCase()),
  )
}
