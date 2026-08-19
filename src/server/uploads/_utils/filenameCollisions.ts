import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import { sanitizeKey } from "./keys"

type ExistingUpload = {
  externalUrl: string
  title: string
}

type ExistingUploadWithFilename<TUpload extends ExistingUpload> = TUpload & {
  filename: string
}

export type UploadFilenameCollision<TUpload extends ExistingUpload = ExistingUpload> = {
  filename: string
  existingUpload: ExistingUploadWithFilename<TUpload>
}

/**
 * Returns the candidate filenames that collide with an already existing upload, including
 * the existing upload that should be treated as the replacement target. Compares
 * case-insensitively against the immutable S3 filename (stored sanitized) and the editable
 * title (defaults to the original filename); the oldest match wins. A match only offers the
 * user a choice, it never replaces anything on its own.
 */
export function findFilenameCollisions<TUpload extends ExistingUpload>(
  candidates: string[],
  existing: TUpload[],
) {
  const byS3Filename = new Map<string, ExistingUploadWithFilename<TUpload>>()
  const byTitle = new Map<string, ExistingUploadWithFilename<TUpload>>()

  for (const upload of existing) {
    const uploadWithFilename = { ...upload, filename: getFilenameFromS3(upload.externalUrl) }
    const filenameKey = uploadWithFilename.filename.toLowerCase()
    const titleKey = upload.title.toLowerCase()
    if (!byS3Filename.has(filenameKey)) byS3Filename.set(filenameKey, uploadWithFilename)
    if (!byTitle.has(titleKey)) byTitle.set(titleKey, uploadWithFilename)
  }

  return candidates.flatMap<UploadFilenameCollision<TUpload>>((filename) => {
    const existingUpload =
      byS3Filename.get(sanitizeKey(filename).toLowerCase()) ?? byTitle.get(filename.toLowerCase())

    return existingUpload ? [{ filename, existingUpload }] : []
  })
}
