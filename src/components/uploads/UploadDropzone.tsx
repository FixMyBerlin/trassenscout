import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@tanstack/react-query"
import { getAcceptAttribute } from "@/src/components/uploads/utils/getFileType"
import { createUploadFn } from "@/src/server/uploads/uploads.functions"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES_PROJECT } from "@/src/shared/uploads/config"
import { getS3Url } from "@/src/shared/uploads/url"
import { UploadDropzoneBase } from "./UploadDropzoneBase"

type CreatedUpload = Awaited<ReturnType<typeof createUploadFn>>

export type UploadFileRecordResult =
  | { file: FileUploadInfo<"complete">; ok: true; upload: CreatedUpload }
  | { file: FileUploadInfo<"complete">; ok: false; error: unknown }

type Props = {
  // Passed as a prop (not read from the route) so the dropzone also works outside
  // `/_loggedInProjects/$projectSlug`, e.g. on admin routes
  projectSlug: string
  subsubsectionIds?: number[]
  acquisitionAreaIds?: number[]
  projectRecordIds?: number[]
  surveyResponseId?: number
  surveySessionId?: number
  onUploadComplete?: (uploadIds: number[]) => Promise<void>
  onBatchStart?: (files: File[]) => void
  onFileRecordResult?: (result: UploadFileRecordResult) => void
  onUploadFail?: (failedFiles: FileUploadInfo<"failed">[]) => void
  fillContainer?: boolean
}

export const UploadDropzone = ({
  projectSlug,
  subsubsectionIds,
  acquisitionAreaIds,
  projectRecordIds,
  surveyResponseId,
  surveySessionId,
  onUploadComplete,
  onBatchStart,
  onFileRecordResult,
  onUploadFail,
  fillContainer,
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
          acquisitionAreas: acquisitionAreaIds?.length ? acquisitionAreaIds : undefined,
          summary: null,
          subsubsections: subsubsectionIds?.length ? subsubsectionIds : undefined,
          projectRecords: projectRecordIds?.length ? projectRecordIds : undefined,
          surveyResponseId: surveyResponseId || null,
          projectRecordEmailId: null,
          mimeType: file.type || null,
          fileSize: file.size || null,
          latitude: null,
          longitude: null,
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
      surveyMeta={
        surveyResponseId && surveySessionId ? { surveyResponseId, surveySessionId } : undefined
      }
      createUploadRecord={createUploadRecord}
      onUploadComplete={onUploadComplete}
      onBatchStart={onBatchStart}
      onUploadFail={onUploadFail}
      fillContainer={fillContainer}
      accept={getAcceptAttribute()}
      description={{
        fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        maxFiles: S3_MAX_FILES_PROJECT,
      }}
    />
  )
}
