import type { FileUploadInfo } from "@better-upload/client"
import { useState } from "react"
import type { UploadFilenameConflictResolution } from "@/src/components/uploads/uploadFilenameConflicts"
import type { UploadFileRecordResult } from "./useUploadRecordCreation"

export type UploadProtocolEntry = {
  filename: string
  status: "pending" | "success" | "uploadFailed" | "recordFailed"
  errorMessage?: string
  /** How the user resolved the conflict with the upload the project already had. */
  existingCollisionResolution?: UploadFilenameConflictResolution
  /** Same filename appears more than once in this batch. */
  collidesInBatch?: boolean
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten."

/**
 * Ephemeral per-batch upload report: collects per-file upload/record results and
 * filename collisions. A new batch replaces the previous protocol.
 */
export const useUploadProtocol = () => {
  const [entries, setEntries] = useState<UploadProtocolEntry[]>([])

  const startBatch = (
    files: { name: string }[],
    resolutions?: Record<string, UploadFilenameConflictResolution>,
  ) => {
    const filenames = files.map((file) => file.name)
    const lowerCounts = new Map<string, number>()
    for (const name of filenames) {
      const key = name.toLowerCase()
      lowerCounts.set(key, (lowerCounts.get(key) ?? 0) + 1)
    }

    setEntries(
      filenames.map((filename) => ({
        filename,
        status: "pending",
        // "keepBoth" holds for every file of that name; "replace" is claimed by whichever
        // file actually took the record over, once `recordResult` knows (see below).
        existingCollisionResolution:
          resolutions?.[filename] === "keepBoth" ? "keepBoth" : undefined,
        collidesInBatch: (lowerCounts.get(filename.toLowerCase()) ?? 0) > 1,
      })),
    )
  }

  const updateFirstPendingEntry = (
    filename: string,
    update: (entry: UploadProtocolEntry) => UploadProtocolEntry,
  ) => {
    setEntries((previous) => {
      const index = previous.findIndex(
        (entry) => entry.status === "pending" && entry.filename === filename,
      )
      if (index === -1) return previous
      const next = [...previous]
      next[index] = update(next[index]!)
      return next
    })
  }

  const recordResult = (result: UploadFileRecordResult) => {
    updateFirstPendingEntry(result.file.name, (entry) => {
      if (!result.ok) {
        return { ...entry, status: "recordFailed", errorMessage: getErrorMessage(result.error) }
      }

      return {
        ...entry,
        status: "success",
        ...(result.replacedUploadId ? { existingCollisionResolution: "replace" as const } : {}),
      }
    })
  }

  const recordUploadFails = (failedFiles: FileUploadInfo<"failed">[]) => {
    for (const file of failedFiles) {
      updateFirstPendingEntry(file.name, (entry) => ({
        ...entry,
        status: "uploadFailed",
        errorMessage: file.error?.message ?? undefined,
      }))
    }
  }

  const reset = () => setEntries([])

  return {
    entries,
    hasProtocol: entries.length > 0,
    finished: entries.length > 0 && entries.every((entry) => entry.status !== "pending"),
    startBatch,
    recordResult,
    recordUploadFails,
    reset,
  }
}
