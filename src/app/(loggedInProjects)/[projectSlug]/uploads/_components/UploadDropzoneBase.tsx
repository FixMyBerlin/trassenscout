"use client"

import { getAcceptAttribute } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { errorMessageTranslations } from "@/src/core/components/forms/errorMessageTranslations"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import type { FileUploadInfo } from "@better-upload/client"
import { useUploadFiles } from "@better-upload/client"
import { useState } from "react"
import { UploadDropzoneProgress } from "./UploadDropzoneProgress"

export type UploadDropzoneBaseDescription = {
  fileTypes?: string
  maxFileSize?: string
  maxFiles?: number
}

type Props = {
  api: string
  metadata?: Record<string, unknown>
  createUploadRecord: (file: FileUploadInfo<"complete">) => Promise<{ id: number } | number>
  onUploadComplete?: (uploadIds: number[]) => Promise<void> | void
  fillContainer?: boolean
  accept?: string
  description?: UploadDropzoneBaseDescription | string
}

const DEFAULT_DESCRIPTION: UploadDropzoneBaseDescription = {
  fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
  maxFiles: S3_MAX_FILES,
}

export const UploadDropzoneBase = ({
  api,
  metadata,
  createUploadRecord,
  onUploadComplete,
  fillContainer,
  accept = getAcceptAttribute(),
  description = DEFAULT_DESCRIPTION,
}: Props) => {
  const [uploadError, setUploadError] = useState<string | null>(null)

  const resolvedDescription =
    typeof description === "string"
      ? description
      : {
          ...DEFAULT_DESCRIPTION,
          ...description,
        }

  const uploader = useUploadFiles({
    route: "upload",
    api,
    onError: (error) => {
      const errorString =
        (error instanceof Error ? error.message : String(error)) ||
        "Ein unbekannter Fehler ist aufgetreten."

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
      metadata={metadata}
      fillContainer={fillContainer}
      error={uploadError}
      onErrorDismiss={() => setUploadError(null)}
      description={resolvedDescription}
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
