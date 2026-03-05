"use client"

import { UploadDropzoneBase } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneBase"
import createSupportDocument from "@/src/server/supportDocuments/mutations/createSupportDocument"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import { getS3Url } from "@/src/server/uploads/_utils/url"
import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@blitzjs/rpc"

type Props = {
  onUploadComplete?: () => Promise<void> | void
}

export const SupportUploadDropzone = ({ onUploadComplete }: Props) => {
  const [createSupportDocumentMutation] = useMutation(createSupportDocument)

  const createUploadRecord = async (file: FileUploadInfo<"complete">) => {
    return createSupportDocumentMutation({
      title: file.name,
      externalUrl: getS3Url(file.objectInfo.key),
      mimeType: file.type || null,
      fileSize: file.size || null,
    })
  }

  return (
    <UploadDropzoneBase
      api="/api/support/documents/upload"
      createUploadRecord={createUploadRecord}
      onUploadComplete={onUploadComplete ? async () => await onUploadComplete() : undefined}
      description={{
        fileTypes: `Alle Dateitypen bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        maxFiles: S3_MAX_FILES,
      }}
    />
  )
}
