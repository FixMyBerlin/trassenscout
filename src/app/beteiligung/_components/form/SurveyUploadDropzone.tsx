"use client"

import { UploadDropzoneBase } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneBase"
import { getAcceptAttribute } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import { getS3Url } from "@/src/server/uploads/_utils/url"
import createSurveyUploadPublic from "@/src/server/uploads/mutations/createSurveyUploadPublic"
import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@blitzjs/rpc"

type Props = {
  surveyResponseId: number
  surveySessionId: number
  onUploadComplete?: (uploadIds: number[]) => Promise<void> | void
}

export const SurveyUploadDropzone = ({
  surveyResponseId,
  surveySessionId,
  onUploadComplete,
}: Props) => {
  const [createUploadMutation] = useMutation(createSurveyUploadPublic)

  const createUploadRecord = async (file: FileUploadInfo<"complete">) => {
    return createUploadMutation({
      title: file.name,
      externalUrl: getS3Url(file.objectInfo.key),
      surveyResponseId,
      surveySessionId,
      mimeType: file.type || null,
      fileSize: file.size || null,
    })
  }

  return (
    <UploadDropzoneBase
      api="/api/survey-upload"
      surveyMeta={{ surveyResponseId, surveySessionId }}
      createUploadRecord={createUploadRecord}
      onUploadComplete={onUploadComplete}
      fillContainer
      accept={getAcceptAttribute()}
      description={{
        fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        maxFiles: S3_MAX_FILES,
      }}
    />
  )
}
