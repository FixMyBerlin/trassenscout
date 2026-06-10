import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@tanstack/react-query"
import { getAcceptAttribute } from "@/src/components/uploads/utils/getFileType"
import { createSurveyUploadPublicFn } from "@/src/server/uploads/uploads.functions"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/shared/uploads/config"
import { getS3Url } from "@/src/shared/uploads/url"
import { UploadDropzoneBase, type UploadDropzoneCompleteItem } from "./UploadDropzoneBase"

type Props = {
  surveyResponseId: number
  surveySessionId: number
  onUploadComplete?: (uploads: UploadDropzoneCompleteItem[]) => Promise<void> | void
}

export const SurveyUploadDropzone = ({
  surveyResponseId,
  surveySessionId,
  onUploadComplete,
}: Props) => {
  const createUploadMutation = useMutation({
    mutationFn: createSurveyUploadPublicFn,
  })

  const createUploadRecord = async (file: FileUploadInfo<"complete">) => {
    return createUploadMutation.mutateAsync({
      data: {
        title: file.name,
        externalUrl: getS3Url(file.objectInfo.key),
        surveyResponseId,
        surveySessionId,
        mimeType: file.type || null,
        fileSize: file.size || null,
      },
    })
  }

  return (
    <UploadDropzoneBase
      api="/api/survey-upload"
      surveyMeta={{ surveyResponseId, surveySessionId }}
      createUploadRecord={createUploadRecord}
      onSurveyPublicUploadBatchComplete={onUploadComplete}
      fillContainer
      accept={getAcceptAttribute()}
      description={{
        fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        maxFiles: S3_MAX_FILES,
      }}
    />
  )
}
