import type { FileUploadInfo } from "@better-upload/client"
import { UploadDropzone } from "@/src/components/uploads/UploadDropzone"
import type { UploadFilenameConflictResolution } from "@/src/components/uploads/uploadFilenameConflicts"
import { useUploadFilenameConflictResolution } from "@/src/components/uploads/useUploadFilenameConflictResolution"
import type { UploadFileRecordResult } from "@/src/components/uploads/useUploadRecordCreation"
import { useUploadRecordCreation } from "@/src/components/uploads/useUploadRecordCreation"
import { getAcceptAttribute } from "@/src/components/uploads/utils/getFileType"
import { S3_MAX_FILE_SIZE_BYTES, S3_MAX_FILES_PROJECT } from "@/src/shared/uploads/config"

type Props = {
  projectSlug: string
  assignSubsubsectionFromFilename: boolean
  onUploadComplete?: (uploadIds: number[]) => Promise<void>
  onBatchStart?: (
    files: File[],
    resolutions?: Record<string, UploadFilenameConflictResolution>,
  ) => void
  onFileRecordResult?: (result: UploadFileRecordResult) => void
  onUploadFail?: (failedFiles: FileUploadInfo<"failed">[]) => void
}

/**
 * Uploads page variant: no relations, but it reports per-file results and lets the page
 * assign a Maßnahme from the filename.
 */
export const UploadsPageDropzone = ({
  projectSlug,
  assignSubsubsectionFromFilename,
  onUploadComplete,
  onBatchStart,
  onFileRecordResult,
  onUploadFail,
}: Props) => {
  const createUploadRecord = useUploadRecordCreation({
    projectSlug,
    assignSubsubsectionFromFilename,
    onFileRecordResult,
  })
  const conflicts = useUploadFilenameConflictResolution({ projectSlug })

  const prepareUpload = async (files: File[]) => {
    const prepared = await conflicts.prepareUpload(files)
    if (prepared) onBatchStart?.(prepared.files, prepared.resolutions)
    return prepared
  }

  return (
    <>
      <UploadDropzone
        api={`/api/${projectSlug}/upload`}
        createUploadRecord={createUploadRecord}
        onUploadComplete={onUploadComplete}
        prepareUpload={prepareUpload}
        onUploadFail={onUploadFail}
        accept={getAcceptAttribute()}
        description={{
          fileTypes: `Bilder, PDF, Office-Dokumente bis ${S3_MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`,
          maxFiles: S3_MAX_FILES_PROJECT,
        }}
      />
      {conflicts.dialog}
    </>
  )
}
