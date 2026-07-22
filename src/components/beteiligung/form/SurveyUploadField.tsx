import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import {
  FieldError,
  getFieldA11yProps,
  getFieldDescriptionId,
} from "@/src/components/beteiligung/form/FieldErrror"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { NumberArraySchema } from "@/src/components/core/utils/schema-shared"
import { SurveyDeleteUploadButton } from "@/src/components/uploads/SurveyDeleteUploadButton"
import { SurveyUploadDropzone } from "@/src/components/uploads/SurveyUploadDropzone"
import type { UploadDropzoneCompleteItem } from "@/src/components/uploads/UploadDropzoneBase"
import { UploadDropzoneContainer } from "@/src/components/uploads/UploadDropzoneContainer"
import { FileTypeIcon } from "@/src/components/uploads/utils/FileTypeIcon"
import { getFileTypeLabel } from "@/src/components/uploads/utils/getFileType"
import { UPLOAD_SIZES } from "@/src/components/uploads/utils/uploadSizes"
import { surveyUploadsMetaQueryOptions } from "@/src/server/uploads/surveyUploadsQueryOptions"

const surveyUploadTokenStorageKey = (surveyResponseId: number) =>
  `survey-upload-tokens-${surveyResponseId}`

type TokenMap = Record<number, string>

type Props = {
  description?: string
  required: boolean
  label: string
  surveyResponseId: number
  surveySessionId: number
}

type UploadMeta = {
  id: number
  title: string
  mimeType: string | null
}

export const SurveyUploadField = ({
  label,
  description,
  required,
  surveyResponseId,
  surveySessionId,
}: Props) => {
  const field = useFieldContext<number[]>()
  const hasError = field.state.meta.errors.length > 0

  const TOKEN_STORAGE_KEY = surveyUploadTokenStorageKey(surveyResponseId)
  const [tokens, setTokens] = useState<TokenMap>(() => {
    try {
      const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY)
      if (raw) return JSON.parse(raw) as TokenMap
    } catch {
      /* corrupt JSON / private mode */
    }
    return {}
  })

  const persistTokens = (updater: (prev: TokenMap) => TokenMap) => {
    setTokens((prev) => {
      const next = updater(prev)
      try {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* quota / private mode */
      }
      return next
    })
  }

  const uploadIds = NumberArraySchema.parse(field.state.value)
  const { data: uploadMetadata = [] } = useQuery({
    ...surveyUploadsMetaQueryOptions({
      surveyResponseId,
      surveySessionId,
      ids: uploadIds,
    }),
    enabled: uploadIds.length > 0,
  })

  const handleUploadComplete = async (uploads: UploadDropzoneCompleteItem[]) => {
    const newUploadIds = uploads.map((u) => u.id)
    const existingUploads = NumberArraySchema.parse(field.state.value)
    const merged = [...new Set([...existingUploads, ...newUploadIds])]
    field.handleChange(merged)

    persistTokens((prev) => {
      const next: TokenMap = { ...prev }
      for (const u of uploads) {
        if (u.publicDeleteToken) {
          next[u.id] = u.publicDeleteToken
        }
      }
      return next
    })
  }

  const handleDelete = (id: number) => {
    field.handleChange(uploadIds.filter((x) => x !== id))
    persistTokens((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <div className="mb-4">
        <p className={formClasses.fieldLabel}>
          {label} {!required && "(optional)"}
        </p>
        {description && (
          <p className={formClasses.fieldDescription} id={getFieldDescriptionId(field.name)}>
            {description}
          </p>
        )}
      </div>

      {uploadMetadata.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {uploadMetadata.map((upload) => (
            <SurveyUploadPreview
              key={upload.id}
              surveyResponseId={surveyResponseId}
              surveySessionId={surveySessionId}
              upload={upload}
              deleteToken={tokens[upload.id]}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div
        role="group"
        aria-label={label}
        {...getFieldA11yProps({ description, fieldName: field.name, hasError })}
      >
        <UploadDropzoneContainer className="h-40 max-w-md border border-gray-300 p-2">
          <SurveyUploadDropzone
            surveyResponseId={surveyResponseId}
            surveySessionId={surveySessionId}
            onUploadComplete={handleUploadComplete}
          />
        </UploadDropzoneContainer>
      </div>

      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}

type SurveyUploadPreviewProps = {
  surveyResponseId: number
  surveySessionId: number
  upload: UploadMeta
  deleteToken: string | undefined
  onDelete: (id: number) => void
}

const SurveyUploadPreview = ({
  surveyResponseId,
  surveySessionId,
  upload,
  deleteToken,
  onDelete,
}: SurveyUploadPreviewProps) => {
  const fileType = getFileTypeLabel(upload.mimeType) || "Unbekannt"
  const sizeConfig = UPLOAD_SIZES["grid"]

  return (
    <div className="relative flex flex-col items-start justify-center rounded-md bg-white text-xs">
      <span
        className={
          sizeConfig.containerHeight +
          " relative w-full overflow-hidden rounded-md border border-gray-200"
        }
      >
        <div className="absolute top-1 right-1 z-10 size-6 rounded-full border border-gray-200 p-0.5">
          <SurveyDeleteUploadButton
            variant="icon"
            surveyResponseId={surveyResponseId}
            surveySessionId={surveySessionId}
            uploadId={upload.id}
            uploadTitle={upload.title}
            deleteToken={deleteToken}
            onDeleted={() => onDelete(upload.id)}
          />
        </div>
        <Tooltip content={fileType}>
          <FileTypeIcon
            mimeType={upload.mimeType}
            className={twJoin(sizeConfig.iconSize, "text-gray-500")}
          />
        </Tooltip>
      </span>
      <p className="mt-1 w-full flex-none truncate text-left text-xs">{upload.title || "-"}</p>
    </div>
  )
}
