"use client"

import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { getFileIcon } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileIcon"
import { getFileTypeLabel } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { UPLOAD_SIZES } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadSizes"
import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { SurveyUploadDropzone } from "@/src/app/beteiligung/_components/form/SurveyUploadDropzone"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"
import { NumberArraySchema } from "@/src/core/utils/schema-shared"
import getUploadsMetaPublic from "@/src/server/uploads/queries/getUploadsMetaPublic"
import { useQuery } from "@blitzjs/rpc"
import { twJoin } from "tailwind-merge"

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

  const uploadIds = NumberArraySchema.parse(field.state.value)
  const [uploadMetadata = []] = useQuery(
    getUploadsMetaPublic,
    {
      surveyResponseId,
      surveySessionId,
      ids: uploadIds,
    },
    {
      enabled: uploadIds.length > 0,
      onError: (error) => {
        console.error("Error fetching upload metadata:", error)
      },
    },
  )

  const previewUploads = uploadMetadata

  const handleUploadComplete = async (newUploadIds: number[]) => {
    const existingUploads = NumberArraySchema.parse(field.state.value)
    const merged = [...new Set([...existingUploads, ...newUploadIds])]
    field.handleChange(merged)
  }

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <div className="mb-4">
        <p className={formClasses.fieldLabel}>
          {label} {!required && "(optional)"}
        </p>
        {description && (
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
      </div>

      {/* Preview of existing uploads */}
      {previewUploads.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {previewUploads.map((upload) => (
            <SurveyUploadPreview key={upload.id} upload={upload} />
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      <UploadDropzoneContainer className="h-40 max-w-md border border-gray-300 p-2">
        <SurveyUploadDropzone
          surveyResponseId={surveyResponseId}
          surveySessionId={surveySessionId}
          onUploadComplete={handleUploadComplete}
        />
      </UploadDropzoneContainer>

      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}

// Reduced preview component (no click, no delete, just icon + title + mimeType)
type SurveyUploadPreviewProps = {
  upload: UploadMeta
}

const SurveyUploadPreview = ({ upload }: SurveyUploadPreviewProps) => {
  const FileIcon = getFileIcon(upload.mimeType)
  const fileType = getFileTypeLabel(upload.mimeType) || "Unbekannt"
  const sizeConfig = UPLOAD_SIZES["grid"]

  return (
    <div className="relative flex flex-col items-start justify-center rounded-md bg-white text-xs ring-1 ring-gray-200/30">
      <span className={sizeConfig.containerHeight + " w-full overflow-hidden rounded-md"}>
        <Tooltip content={fileType}>
          <FileIcon
            className={twJoin(
              sizeConfig.iconSize,
              "rounded-lg border border-gray-200 text-gray-500",
            )}
          />
        </Tooltip>
      </span>
      <p className="mt-1 w-full flex-none truncate text-left text-xs">{upload.title || "-"}</p>
    </div>
  )
}
