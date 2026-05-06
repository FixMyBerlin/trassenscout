"use client"

import { errorMessageTranslations } from "@/src/core/components/forms/errorMessageTranslations"
import type { FileUploadInfo } from "@better-upload/client"
import { useUploadFiles } from "@better-upload/client"
import { useState } from "react"
import { UploadDropzoneProgress } from "./UploadDropzoneProgress"

export type UploadDropzoneBaseDescription = {
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
  fillContainer?: boolean
  accept?: string
  description?: UploadDropzoneBaseDescription | string
}

export const UploadDropzoneBase = ({
  api,
  surveyMeta,
  createUploadRecord,
  onUploadComplete,
  onSurveyPublicUploadBatchComplete,
  fillContainer,
  accept,
  description,
}: Props) => {
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploader = useUploadFiles({
    route: "upload",
    api,
    onError: (error) => {
      // Follow better-upload pattern: use error.message with fallback
      // See: https://github.com/Nic13Gamer/better-upload/blob/main/apps/docs/content/docs/guides/forms/react-hook-form.mdx
      // This handles pre-upload errors (e.g., "Too many files")
      // Per-file errors are shown in the FileUploadItem component
      const errorString =
        (error instanceof Error ? error.message : String(error)) ||
        "Ein unbekannter Fehler ist aufgetreten."
      // Translate error message using the same system as Prisma errors
      const errorMessage = errorMessageTranslations[errorString] || errorString
      setUploadError(errorMessage)
    },
    onUploadFail: () => {
      // Silent fail - errors are shown per-file in the UI
    },
    onUploadComplete: async ({ files }: { files: FileUploadInfo<"complete">[] }) => {
      const uploads: UploadDropzoneCompleteItem[] = []
      for (const file of files) {
        try {
          const result = await createUploadRecord(file)
          const id = typeof result === "number" ? result : result.id
          const publicDeleteToken =
            typeof result === "object" && result !== null
              ? ((result as { publicDeleteToken?: string | null }).publicDeleteToken ?? null)
              : null
          uploads.push({ id, publicDeleteToken })
        } catch (error) {
          console.error("Error creating upload record:", error)
        }
      }

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
