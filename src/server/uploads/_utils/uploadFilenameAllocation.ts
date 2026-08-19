import { getFilenameFromS3 } from "@/src/shared/uploads/url"
import { dedupeUploadFilename } from "./dedupeUploadFilename"
import { findFilenameCollisions } from "./filenameCollisions"
import { sanitizeKey } from "./keys"

type ExistingUpload = { externalUrl: string; title: string }

export type UploadFilenameAllocation = {
  filename: string
  replacesUploadId: number | null
}

const countKeys = (keys: string[]) =>
  keys.reduce(
    (counts, key) => counts.set(key, (counts.get(key) ?? 0) + 1),
    new Map<string, number>(),
  )

export function createUploadFilenameAllocator({
  filenames,
  existing,
  replacementTargets = [],
}: {
  filenames: string[]
  existing: ExistingUpload[]
  replacementTargets?: (ExistingUpload & { id: number })[]
}) {
  const replacedIdByFilename = new Map<string, number>()
  const claimedIds = new Set<number>()
  for (const { filename, existingUpload } of findFilenameCollisions(
    filenames,
    replacementTargets,
  )) {
    if (replacedIdByFilename.has(filename) || claimedIds.has(existingUpload.id)) continue
    replacedIdByFilename.set(filename, existingUpload.id)
    claimedIds.add(existingUpload.id)
  }

  const existingCounts = countKeys(
    existing.map((upload) => getFilenameFromS3(upload.externalUrl).toLowerCase()),
  )
  const replacedCounts = countKeys(
    [...replacedIdByFilename.keys()].map((name) => sanitizeKey(name).toLowerCase()),
  )
  const takenLower = new Set(
    [...existingCounts]
      .filter(([name, count]) => count > (replacedCounts.get(name) ?? 0))
      .map(([name]) => name),
  )

  return function claimUploadFilename(filename: string): UploadFilenameAllocation {
    const replacesUploadId = replacedIdByFilename.get(filename) ?? null
    // Consume it, so a second file of the same name is added instead of replacing again.
    replacedIdByFilename.delete(filename)

    return { filename: dedupeUploadFilename(filename, takenLower), replacesUploadId }
  }
}
