import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@tanstack/react-query"
import type { UploadFileRecordResult } from "@/src/components/uploads/UploadDropzone"
import { UploadDropzoneBase } from "@/src/components/uploads/UploadDropzoneBase"
import { getAcceptAttribute } from "@/src/components/uploads/utils/getFileType"
import { createUploadFn } from "@/src/server/uploads/uploads.functions"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES_PROJECT } from "@/src/shared/uploads/config"
import { getS3Url } from "@/src/shared/uploads/url"

type Props = {
  projectSlug: string
  assignSubsubsectionFromFilename: boolean
  onUploadComplete?: (uploadIds: number[]) => Promise<void>
  onBatchStart?: (files: File[]) => void
  onFileRecordResult?: (result: UploadFileRecordResult) => void
  onUploadFail?: (failedFiles: FileUploadInfo<"failed">[]) => void
}

/**
 * Uploads-page dropzone that can assign Maßnahmen from filenames.
 * Kept separate from the generic UploadDropzone used elsewhere.
 */
export const UploadsPageDropzone = ({
  projectSlug,
  assignSubsubsectionFromFilename,
  onUploadComplete,
  onBatchStart,
  onFileRecordResult,
  onUploadFail,
}: Props) => {
  const createUploadMutation = useMutation({
    mutationFn: createUploadFn,
  })

  const createUploadRecord = async (file: FileUploadInfo<"complete">) => {
    try {
      const upload = await createUploadMutation.mutateAsync({
        data: {
          title: file.name,
          externalUrl: getS3Url(file.objectInfo.key),
          projectSlug,
          acquisitionAreas: undefined,
          summary: null,
          subsubsections: undefined,
          projectRecords: undefined,
          surveyResponseId: null,
          projectRecordEmailId: null,
          mimeType: file.type || null,
          fileSize: file.size || null,
          latitude: null,
          longitude: null,
          assignSubsubsectionFromFilename,
        },
      })
      onFileRecordResult?.({ file, ok: true, upload })
      return upload
    } catch (error) {
      onFileRecordResult?.({ file, ok: false, error })
      throw error
    }
  }

  return (
    <UploadDropzoneBase
      api={`/api/${projectSlug}/upload`}
      createUploadRecord={createUploadRecord}
      onUploadComplete={onUploadComplete}
      onBatchStart={onBatchStart}
      onUploadFail={onUploadFail}
      accept={getAcceptAttribute()}
      description={{
        fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        maxFiles: S3_MAX_FILES_PROJECT,
      }}
    />
  )
}
