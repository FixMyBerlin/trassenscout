"use client"

import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
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
    />
  )
}
