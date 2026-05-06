"use client"

import type { UploadDropzoneCompleteItem } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneBase"
import { UploadDropzoneContainer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDropzoneContainer"
import { getFileIcon } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileIcon"
import { getFileTypeLabel } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { UPLOAD_SIZES } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadSizes"
import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { SurveyDeleteUploadButton } from "@/src/app/beteiligung/_components/form/SurveyDeleteUploadButton"
import { SurveyUploadDropzone } from "@/src/app/beteiligung/_components/form/SurveyUploadDropzone"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"
import { NumberArraySchema } from "@/src/core/utils/schema-shared"
import getUploadsMetaPublic from "@/src/server/uploads/queries/getUploadsMetaPublic"
import { useQuery } from "@blitzjs/rpc"
import { useEffect, useState } from "react"
import { twJoin } from "tailwind-merge"

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

  // Stable empty state for SSR + first client render. Tokens are loaded from
  // sessionStorage in useEffect after hydration to avoid hydration mismatches.
  // See https://nextjs.org/docs/messages/react-hydration-error
  const [tokens, setTokens] = useState<TokenMap>({})

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(TOKEN_STORAGE_KEY)
      if (raw) setTokens(JSON.parse(raw) as TokenMap)
    } catch {
      /* corrupt JSON / private mode — best-effort
      If we cannot read or parse stored tokens, we keep an empty map so the form still works. */
    }
  }, [TOKEN_STORAGE_KEY])

  const persistTokens = (updater: (prev: TokenMap) => TokenMap) => {
    setTokens((prev) => {
      const next = updater(prev)
      try {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* quota / private mode — best-effort
           React state still updates, but tokens may not survive a page reload if storage refuses the write. */
      }
      return next
    })
  }

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
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
      </div>

      {/* Preview of existing uploads */}
      {previewUploads.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {previewUploads.map((upload) => (
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

// Reduced preview component (icon + title + mimeType; delete overlay)
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
  const FileIcon = getFileIcon(upload.mimeType)
  const fileType = getFileTypeLabel(upload.mimeType) || "Unbekannt"
  const sizeConfig = UPLOAD_SIZES["grid"]

  return (
    <div className="relative flex flex-col items-start justify-center rounded-md bg-white text-xs">
      <div className="absolute -top-1 -right-1 z-10">
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
