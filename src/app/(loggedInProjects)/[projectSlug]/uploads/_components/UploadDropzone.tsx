"use client"

import { getAcceptAttribute } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import { getS3Url } from "@/src/server/uploads/_utils/url"
import createUpload from "@/src/server/uploads/mutations/createUpload"
import type { FileUploadInfo } from "@better-upload/client"
import { useUploadFiles } from "@better-upload/client"
import { useMutation } from "@blitzjs/rpc"
import { useState } from "react"
import { UploadDropzoneProgress } from "./UploadDropzoneProgress"

type Props = {
  subsubsectionId?: number
  subsectionId?: number
  onUploadComplete?: (uploadIds: number[]) => Promise<void>
  fillContainer?: boolean
}

export const UploadDropzone = ({
  subsubsectionId,
  subsectionId,
  onUploadComplete,
  fillContainer,
}: Props) => {
  const projectSlug = useProjectSlug()
  const [createUploadMutation] = useMutation(createUpload)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploader = useUploadFiles({
    route: "upload",
    api: `/api/${projectSlug}/upload`,
    onError: (error) => {
      console.error("Upload error:", error)
      // Follow better-upload pattern: use error.message with fallback
      // See: https://github.com/Nic13Gamer/better-upload/blob/main/apps/docs/content/docs/guides/forms/react-hook-form.mdx
      // This handles pre-upload errors (e.g., "Too many files")
      // Per-file errors are shown in the FileUploadItem component
      const errorMessage =
        (error instanceof Error ? error.message : String(error)) || "Ein Fehler ist aufgetreten."
      setUploadError(errorMessage)
    },
    onUploadFail: ({ succeededFiles, failedFiles }) => {
      console.error("Upload failed:", { succeededFiles, failedFiles })
    },
    onUploadComplete: async ({ files }: { files: FileUploadInfo<"complete">[] }) => {
      const uploadIds: number[] = []
      for (const file of files) {
        try {
          const upload = await createUploadMutation({
            title: file.name,
            externalUrl: getS3Url(file.objectInfo.key),
            projectSlug: projectSlug,
            subsectionId: subsectionId || null,
            summary: null, // Users can add this in step 2 /edit
            subsubsectionId: subsubsectionId || null,
            mimeType: file.type || null,
            // latitude and longitude will be extracted server-side from EXIF data
            latitude: null,
            longitude: null,
          })

          uploadIds.push(upload.id)
        } catch (error) {
          console.error("Error creating upload record:", error)
        }
      }

      if (onUploadComplete) {
        await onUploadComplete(uploadIds)
      }
    },
  })

  const maxFileSizeMB = S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)

  return (
    <UploadDropzoneProgress
      control={uploader.control}
      accept={getAcceptAttribute()}
      fillContainer={fillContainer}
      error={uploadError}
      onErrorDismiss={() => setUploadError(null)}
      description={{
        fileTypes: `Bilder, PDF, Office-Dokumente bis ${maxFileSizeMB} MB`,
        maxFiles: S3_MAX_FILES,
      }}
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
