import { useEffect, useRef, useState } from "react"
import type { PreparedUploadBatch } from "@/src/components/uploads/UploadDropzone"
import { checkUploadFilenameCollisionsFn } from "@/src/server/uploads/uploads.functions"
import { UploadFilenameConflictDialog } from "./UploadFilenameConflictDialog"
import type {
  UploadFilenameConflict,
  UploadFilenameConflictChoice,
  UploadFilenameConflictResolution,
} from "./uploadFilenameConflicts"
import { oneConflictPerUpload } from "./uploadFilenameConflicts"

type PreparedConflictBatch = PreparedUploadBatch & {
  /** How the user resolved each conflicting filename, for the uploads page protocol. */
  resolutions?: Record<string, UploadFilenameConflictResolution>
}

type PendingConflictDialog = {
  collisions: UploadFilenameConflict[]
  resolve: (choice: UploadFilenameConflictChoice) => void
}

/**
 * Google-Drive-style preflight: asks the server whether any of the picked filenames already
 * exist in the project and lets the user replace them or keep both. Which upload a file
 * actually replaces is decided by the upload router, not here — this only reports the ids
 * the user approved. Pass `enabled: false` where replacing a project upload makes no sense
 * (survey response attachments) — `checkUploadFilenameCollisions` is editor-only anyway.
 */
export function useUploadFilenameConflictResolution({
  projectSlug,
  enabled = true,
}: {
  projectSlug: string
  enabled?: boolean
}) {
  const [pendingDialog, setPendingDialog] = useState<PendingConflictDialog | null>(null)
  const cancelPendingDialogRef = useRef<(() => void) | null>(null)

  // The dropzone can unmount mid-dialog (its modal closes); leave no batch awaiting forever.
  useEffect(() => () => cancelPendingDialogRef.current?.(), [])

  const prepareUpload = async (files: File[]): Promise<PreparedConflictBatch | null> => {
    if (!enabled) return { files }

    let collisions: UploadFilenameConflict[] = []
    try {
      const result = await checkUploadFilenameCollisionsFn({
        data: { projectSlug, filenames: files.map((file) => file.name) },
      })
      collisions = oneConflictPerUpload(result.collisions)
    } catch (error) {
      // Degrade to the plain upload: the server still dedupes the filename.
      console.error("Error checking filename collisions before upload:", error)
      return { files }
    }

    if (!collisions.length) return { files }

    const choice = await new Promise<UploadFilenameConflictChoice>((resolve) => {
      cancelPendingDialogRef.current = () => resolve("cancel")
      setPendingDialog({ collisions, resolve })
    })
    cancelPendingDialogRef.current = null
    setPendingDialog(null)

    if (choice === "cancel") return null

    const resolutions = Object.fromEntries(
      collisions.map((collision) => [collision.filename, choice]),
    )
    if (choice === "keepBoth") return { files, resolutions }

    return {
      files,
      resolutions,
      metadata: { replaceUploadIds: collisions.map((collision) => collision.existingUpload.id) },
    }
  }

  const dialog = pendingDialog ? (
    <UploadFilenameConflictDialog
      collisions={pendingDialog.collisions}
      onChoose={pendingDialog.resolve}
    />
  ) : null

  return { dialog, prepareUpload }
}
