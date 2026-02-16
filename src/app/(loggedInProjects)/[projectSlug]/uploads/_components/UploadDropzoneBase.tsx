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

type Props = {
  api: string
  surveyMeta?: SurveyUploadMetadata
  createUploadRecord: (file: FileUploadInfo<"complete">) => Promise<{ id: number } | number>
  onUploadComplete?: (uploadIds: number[]) => Promise<void> | void
  fillContainer?: boolean
  accept?: string
  description?: UploadDropzoneBaseDescription | string
}

export const UploadDropzoneBase = ({
  api,
  surveyMeta,
  createUploadRecord,
  onUploadComplete,
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
      const uploadIds: number[] = []
      for (const file of files) {
        try {
          const result = await createUploadRecord(file)
          const id = typeof result === "number" ? result : result.id
          uploadIds.push(id)
        } catch (error) {
          console.error("Error creating upload record:", error)
        }
      }

      if (onUploadComplete) {
        await onUploadComplete(uploadIds)
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
