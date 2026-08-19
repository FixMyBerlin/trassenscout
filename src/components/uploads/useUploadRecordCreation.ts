import type { FileUploadInfo } from "@better-upload/client"
import { useMutation } from "@tanstack/react-query"
import { createUploadFn, replaceUploadFileFn } from "@/src/server/uploads/uploads.functions"
import { REPLACES_UPLOAD_ID_METADATA_KEY } from "@/src/shared/uploads/config"
import { getS3Url } from "@/src/shared/uploads/url"

type CreatedUpload = Awaited<ReturnType<typeof createUploadFn>>

export type UploadFileRecordResult =
  | {
      file: FileUploadInfo<"complete">
      ok: true
      upload: CreatedUpload
      /** Set when this file took an existing upload over rather than creating a new one. */
      replacedUploadId: number | null
    }
  | { file: FileUploadInfo<"complete">; ok: false; error: unknown }

type Props = {
  projectSlug: string
  /** Records the new upload is linked to; a replacement is linked in on top of what it has. */
  relations?: {
    acquisitionAreas?: number[]
    subsubsections?: number[]
    projectRecords?: number[]
    surveyResponseId?: number
  }
  assignSubsubsectionFromFilename?: boolean
  onFileRecordResult?: (result: UploadFileRecordResult) => void
}

const ids = (values?: number[]) => (values?.length ? values : undefined)

/** The upload this file takes over, as decided by the upload router. */
function replacedUploadId(file: FileUploadInfo<"complete">) {
  const value = file.objectInfo.metadata?.[REPLACES_UPLOAD_ID_METADATA_KEY]
  return typeof value === "string" ? Number(value) || null : null
}

/**
 * Turns an uploaded file into its DB record. Whether it takes over an existing upload or
 * becomes a new one was decided by the upload router and travels in the object metadata.
 */
export function useUploadRecordCreation({
  projectSlug,
  relations,
  assignSubsubsectionFromFilename,
  onFileRecordResult,
}: Props) {
  const createUpload = useMutation({ mutationFn: createUploadFn })
  const replaceUploadFile = useMutation({ mutationFn: replaceUploadFileFn })

  return async function createUploadRecord(file: FileUploadInfo<"complete">) {
    const shared = {
      projectSlug,
      externalUrl: getS3Url(file.objectInfo.key),
      mimeType: file.type || null,
      fileSize: file.size || null,
      acquisitionAreas: ids(relations?.acquisitionAreas),
      subsubsections: ids(relations?.subsubsections),
      projectRecords: ids(relations?.projectRecords),
      surveyResponseId: relations?.surveyResponseId ?? null,
      projectRecordEmailId: null,
    }

    try {
      const replacesUploadId = replacedUploadId(file)
      const upload = replacesUploadId
        ? // Title, summary and existing links stay with the record it takes over.
          await replaceUploadFile.mutateAsync({ data: { ...shared, id: replacesUploadId } })
        : await createUpload.mutateAsync({
            data: {
              ...shared,
              title: file.name,
              summary: null,
              latitude: null,
              longitude: null,
              assignSubsubsectionFromFilename,
            },
          })
      onFileRecordResult?.({ file, ok: true, upload, replacedUploadId: replacesUploadId })
      return upload
    } catch (error) {
      onFileRecordResult?.({ file, ok: false, error })
      throw error
    }
  }
}
