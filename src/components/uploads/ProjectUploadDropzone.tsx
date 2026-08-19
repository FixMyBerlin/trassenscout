import type { FileUploadInfo } from "@better-upload/client"
import { getAcceptAttribute } from "@/src/components/uploads/utils/getFileType"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES_PROJECT } from "@/src/shared/uploads/config"
import { UploadDropzone } from "./UploadDropzone"
import { useUploadFilenameConflictResolution } from "./useUploadFilenameConflictResolution"
import type { UploadFileRecordResult } from "./useUploadRecordCreation"
import { useUploadRecordCreation } from "./useUploadRecordCreation"

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
  onFileRecordResult?: (result: UploadFileRecordResult) => void
  onUploadFail?: (failedFiles: FileUploadInfo<"failed">[]) => void
  fillContainer?: boolean
}

export const ProjectUploadDropzone = ({
  projectSlug,
  subsubsectionIds,
  acquisitionAreaIds,
  projectRecordIds,
  surveyResponseId,
  surveySessionId,
  onUploadComplete,
  onFileRecordResult,
  onUploadFail,
  fillContainer,
}: Props) => {
  const createUploadRecord = useUploadRecordCreation({
    projectSlug,
    relations: {
      acquisitionAreas: acquisitionAreaIds,
      subsubsections: subsubsectionIds,
      projectRecords: projectRecordIds,
      surveyResponseId,
    },
    onFileRecordResult,
  })

  const { dialog, prepareUpload } = useUploadFilenameConflictResolution({
    projectSlug,
    enabled: !surveyResponseId,
  })

  return (
    <>
      <UploadDropzone
        api={`/api/${projectSlug}/upload`}
        viewerUploadMeta={
          surveyResponseId && surveySessionId
            ? { surveyResponseId, surveySessionId }
            : projectRecordIds?.[0]
              ? { projectRecordId: projectRecordIds[0] }
              : undefined
        }
        createUploadRecord={createUploadRecord}
        onUploadComplete={onUploadComplete}
        prepareUpload={prepareUpload}
        onUploadFail={onUploadFail}
        fillContainer={fillContainer}
        accept={getAcceptAttribute()}
        description={{
          fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
          maxFiles: S3_MAX_FILES_PROJECT,
        }}
      />
      {dialog}
    </>
  )
}
