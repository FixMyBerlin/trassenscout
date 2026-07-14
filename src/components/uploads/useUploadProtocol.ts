import type { FileUploadInfo } from "@better-upload/client"
import { useState } from "react"
import { checkUploadFilenameCollisionsFn } from "@/src/server/uploads/uploads.functions"
import type { UploadFileRecordResult } from "./UploadDropzone"

export type UploadProtocolEntry = {
  filename: string
  status: "pending" | "success" | "uploadFailed" | "recordFailed"
  errorMessage?: string
  /** Same filename already exists among the project's uploads. */
  collidesWithExisting?: boolean
  /** Same filename appears more than once in this batch. */
  collidesInBatch?: boolean
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten."

/**
 * Ephemeral per-batch upload report: collects per-file upload/record results and
 * filename collisions. A new batch replaces the previous protocol.
 */
export const useUploadProtocol = ({ projectSlug }: { projectSlug: string }) => {
  const [entries, setEntries] = useState<UploadProtocolEntry[]>([])

  const startBatch = (files: { name: string }[]) => {
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
        collidesInBatch: (lowerCounts.get(filename.toLowerCase()) ?? 0) > 1,
      })),
    )

    // Warn-only check against existing uploads; runs while the S3 upload is in flight
    checkUploadFilenameCollisionsFn({ data: { projectSlug, filenames } })
      .then(({ collidingFilenames }) => {
        const colliding = new Set(collidingFilenames.map((name) => name.toLowerCase()))
        setEntries((previous) =>
          previous.map((entry) =>
            colliding.has(entry.filename.toLowerCase())
              ? { ...entry, collidesWithExisting: true }
              : entry,
          ),
        )
      })
      .catch((error) => {
        console.error("Error checking filename collisions:", error)
      })
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

      return { ...entry, status: "success" }
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
