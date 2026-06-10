import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@tanstack/react-query"
import { UploadDropzoneBase } from "@/src/components/uploads/UploadDropzoneBase"
import { createSupportDocumentFn } from "@/src/server/supportDocuments/supportDocuments.functions"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/shared/uploads/config"
import { getS3Url } from "@/src/shared/uploads/url"

type Props = {
  onUploadComplete?: () => Promise<void> | void
}

export const SupportUploadDropzone = ({ onUploadComplete }: Props) => {
  const createSupportDocumentMutation = useMutation({
    mutationFn: createSupportDocumentFn,
  })

  const createUploadRecord = async (file: FileUploadInfo<"complete">) => {
    return createSupportDocumentMutation.mutateAsync({
      data: {
        title: file.name,
        externalUrl: getS3Url(file.objectInfo.key),
        mimeType: file.type || null,
        fileSize: file.size || null,
      },
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
