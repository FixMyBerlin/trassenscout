import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { getAcceptAttribute } from "@/src/components/uploads/utils/getFileType"
import { createUploadFn } from "@/src/server/uploads/uploads.functions"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES } from "@/src/shared/uploads/config"
import { getS3Url } from "@/src/shared/uploads/url"
import { UploadDropzoneBase } from "./UploadDropzoneBase"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  subsubsectionIds?: number[]
  acquisitionAreaIds?: number[]
  projectRecordIds?: number[]
  surveyResponseId?: number
  onUploadComplete?: (uploadIds: number[]) => Promise<void>
  fillContainer?: boolean
}

export const UploadDropzone = ({
  subsubsectionIds,
  acquisitionAreaIds,
  projectRecordIds,
  surveyResponseId,
  onUploadComplete,
  fillContainer,
}: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const createUploadMutation = useMutation({
    mutationFn: createUploadFn,
  })

  const createUploadRecord = async (file: FileUploadInfo<"complete">) => {
    return createUploadMutation.mutateAsync({
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
