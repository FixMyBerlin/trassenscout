import type { checkUploadFilenameCollisionsFn } from "@/src/server/uploads/uploads.functions"

/** One filename the project already has, plus the upload that holds it. */
export type UploadFilenameConflict = Awaited<
  ReturnType<typeof checkUploadFilenameCollisionsFn>
>["collisions"][number]

export type UploadFilenameConflictChoice = "replace" | "keepBoth" | "cancel"
export type UploadFilenameConflictResolution = Exclude<UploadFilenameConflictChoice, "cancel">

/**
 * One row per existing upload: the same upload can match two picked files — once by its
 * stored filename, once by its title — and the dialog should offer it only once.
 */
export function oneConflictPerUpload(collisions: UploadFilenameConflict[]) {
  const seenUploadIds = new Set<number>()

  return collisions.filter(({ existingUpload }) => {
    if (seenUploadIds.has(existingUpload.id)) return false
    seenUploadIds.add(existingUpload.id)
    return true
  })
}
