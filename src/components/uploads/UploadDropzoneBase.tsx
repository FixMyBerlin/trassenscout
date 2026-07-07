import type { FileUploadInfo } from "@better-upload/client"
import { useUploadFiles } from "@better-upload/client"
import { useState } from "react"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { UploadDropzoneProgress } from "./UploadDropzoneProgress"

type UploadDropzoneBaseDescription = {
  fileTypes?: string
  maxFileSize?: string
  maxFiles?: number
}

export type SurveyUploadMetadata = {
  surveyResponseId: number
  surveySessionId: number
}

/** Payload for the optional public survey batch callback (Beteiligung only). */
export type UploadDropzoneCompleteItem = {
  id: number
  publicDeleteToken: string | null
}

type Props = {
  api: string
  surveyMeta?: SurveyUploadMetadata
  createUploadRecord: (file: FileUploadInfo<"complete">) => Promise<{ id: number } | number>
  onUploadComplete?: (uploadIds: number[]) => Promise<void> | void
  /** Only used by the public survey (`beteiligung`) dropzone — receives delete capability tokens from `createSurveyUploadPublic`. */
  onSurveyPublicUploadBatchComplete?: (items: UploadDropzoneCompleteItem[]) => Promise<void> | void
  /** Called with the full file selection before the S3 upload starts. */
  onBatchStart?: (files: File[]) => void
  /** Called once per batch when some files failed to reach S3 (never called if all succeed). */
  onUploadFail?: (failedFiles: FileUploadInfo<"failed">[]) => void
  fillContainer?: boolean
  accept?: string
  description?: UploadDropzoneBaseDescription | string
}

// Creating a DB record per file includes relation validation and (for images) an S3 EXIF
// read — sequential creation would stall large batches, unbounded would hammer the server.
const CREATE_RECORD_CONCURRENCY = 4

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = Array.from({ length: items.length })
  let nextIndex = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++
      results[index] = await fn(items[index]!)
    }
  })
  await Promise.all(workers)
  return results
}

export const UploadDropzoneBase = ({
  api,
  surveyMeta,
  createUploadRecord,
  onUploadComplete,
  onSurveyPublicUploadBatchComplete,
  onBatchStart,
  onUploadFail,
  fillContainer,
  accept,
  description,
}: Props) => {
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploader = useUploadFiles({
    route: "upload",
    api,
    onError: (error) => {
      const errorString = error.message || "Ein unbekannter Fehler ist aufgetreten."
      const errorMessage = translateServerError(errorString)
      setUploadError(errorMessage)
    },
    onUploadFail: ({ failedFiles }: { failedFiles: FileUploadInfo<"failed">[] }) => {
      // Errors are shown per-file in the UI; forward them for batch reporting
      if (onUploadFail) onUploadFail(failedFiles)
    },
    onUploadComplete: async ({ files }: { files: FileUploadInfo<"complete">[] }) => {
      const results = await mapWithConcurrency(files, CREATE_RECORD_CONCURRENCY, async (file) => {
        try {
          const result = await createUploadRecord(file)
          const id = typeof result === "number" ? result : result.id
          const publicDeleteToken =
            typeof result === "object" && result !== null
              ? ((result as { publicDeleteToken?: string | null }).publicDeleteToken ?? null)
              : null
          return { id, publicDeleteToken }
        } catch (error) {
          console.error("Error creating upload record:", error)
          return null
        }
      })
      const uploads: UploadDropzoneCompleteItem[] = results.filter((r) => r !== null)

      const uploadIds = uploads.map((u) => u.id)

      if (onUploadComplete) {
        await onUploadComplete(uploadIds)
      }
      if (onSurveyPublicUploadBatchComplete) {
        await onSurveyPublicUploadBatchComplete(uploads)
      }
    },
  })

  return (
    <UploadDropzoneProgress
      control={uploader.control}
      uploadOverride={
        onBatchStart
          ? (files, options) => {
              onBatchStart(Array.from(files))
              uploader.upload(files, options)
            }
          : undefined
      }
      accept={accept}
      surveyMeta={surveyMeta}
      fillContainer={fillContainer}
      error={uploadError}
      onErrorDismiss={() => setUploadError(null)}
      description={description}
      translations={{
        dragAndDrop: "Dateien hierher ziehen und ablegen",
        dropFiles: "Dateien hier ablegen",
        failed: "Fehlgeschlagen",
        completed: "Abgeschlossen",
        youCanUpload: "Sie können",
        upTo: "Bis zu",
        eachUpTo: "Jeweils bis zu",
        accepted: "Akzeptiert",
        file: "Datei",
        files: "Dateien",
      }}
    />
  )
}
