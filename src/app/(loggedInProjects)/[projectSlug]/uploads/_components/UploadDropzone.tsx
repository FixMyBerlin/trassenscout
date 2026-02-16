"use client"

import { getAcceptAttribute } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/server/uploads/_utils/config"
import { getS3Url } from "@/src/server/uploads/_utils/url"
import createUpload from "@/src/server/uploads/mutations/createUpload"
import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@blitzjs/rpc"
import { UploadDropzoneBase } from "./UploadDropzoneBase"

type Props = {
  subsubsectionId?: number
  subsectionId?: number
  surveyResponseId?: number
  onUploadComplete?: (uploadIds: number[]) => Promise<void>
  fillContainer?: boolean
}

export const UploadDropzone = ({
  subsubsectionId,
  subsectionId,
  surveyResponseId,
  onUploadComplete,
  fillContainer,
}: Props) => {
  const projectSlug = useProjectSlug()
  const [createUploadMutation] = useMutation(createUpload)

  const createUploadRecord = async (file: FileUploadInfo<"complete">) => {
    return createUploadMutation({
      title: file.name,
      externalUrl: getS3Url(file.objectInfo.key),
      projectSlug,
      subsectionId: subsectionId || null,
      summary: null,
      subsubsectionId: subsubsectionId || null,
      surveyResponseId: surveyResponseId || null,
      mimeType: file.type || null,
      fileSize: file.size || null,
      // latitude and longitude will be extracted server-side from EXIF data
      latitude: null,
      longitude: null,
    })
  }

  return (
    <UploadDropzoneBase
      api={`/api/${projectSlug}/upload`}
      createUploadRecord={createUploadRecord}
      onUploadComplete={onUploadComplete}
      fillContainer={fillContainer}
      accept={getAcceptAttribute()}
      description={{
        fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
        maxFiles: S3_MAX_FILES,
      }}
    />
  )
}
