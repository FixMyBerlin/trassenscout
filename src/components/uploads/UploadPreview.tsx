import { UserGroupIcon } from "@heroicons/react/24/outline"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { twJoin } from "tailwind-merge"
import { UploadIcon } from "@/src/components/uploads/UploadIcon"
import { UPLOAD_SIZES, UploadSize } from "@/src/components/uploads/utils/uploadSizes"
import { Upload } from "@/src/prisma/generated/browser"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { isDeletedUploadMarker } from "./uploadTypes"

type UploadPreviewData = Pick<
  Upload,
  "id" | "mimeType" | "title" | "externalUrl" | "collaborationUrl"
>

type Props = {
  projectSlug: string
  size: UploadSize
  showTitle: boolean
  onClick?: () => void
  onPointerEnter?: () => void
  onFocus?: () => void
} & ({ uploadId: number; upload?: never } | { upload: UploadPreviewData; uploadId?: never })

export const UploadPreview = (props: Props) => {
  const { projectSlug, size, showTitle, onClick, onPointerEnter, onFocus } = props
  const previewButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(
    function markUploadPreviewReadyAfterHydration() {
      if (!onClick) return
      previewButtonRef.current?.setAttribute("data-upload-preview-ready", "true")
    },
    [onClick],
  )

  const uploadFromProps = "upload" in props ? props.upload : undefined
  const uploadId = "uploadId" in props ? props.uploadId : uploadFromProps?.id
  const needsPreviewQuery = Boolean(uploadId) && !uploadFromProps

  const { data: uploadFromQuery } = useQuery({
    ...uploadQueryOptions({ projectSlug, id: uploadId! }),
    enabled: needsPreviewQuery,
  })

  const upload = uploadFromQuery ?? uploadFromProps

  if (!upload || isDeletedUploadMarker(upload)) return null

  const sizeConfig = UPLOAD_SIZES[size]
  const isTable = size === "table"

  const iconContainer = (
    <span
      className={twJoin(
        sizeConfig.containerWidth,
        sizeConfig.containerHeight,
        "inline-flex shrink-0 items-center justify-center",
        isTable ? "rounded-md" : "rounded-xl",
      )}
    >
      <UploadIcon
        upload={upload}
        projectSlug={projectSlug}
        size={size}
        showFrame={size === "grid" && !onClick}
      />
    </span>
  )

  const descriptionText = showTitle ? (
    <p className="mt-1 w-full flex-none truncate text-left">{upload.title || "-"}</p>
  ) : null

  const collaborationIcon =
    upload.collaborationUrl && size !== "table" ? (
      <div className="absolute -top-1 -right-1 z-10 rounded-full bg-yellow-500 p-1.5">
        <UserGroupIcon className="size-4 text-white" />
      </div>
    ) : null

  const containerClassName =
    size === "grid" ? "max-w-[112px]" : size === "detail" ? "max-w-[176px]" : ""

  if (onClick) {
    return (
      <button
        ref={previewButtonRef}
        type="button"
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onFocus={onFocus}
        className={twJoin(
          "relative flex cursor-pointer flex-col items-start justify-center rounded-md bg-white text-xs hover:outline-hidden",
          isTable
            ? "border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            : "ring-1 ring-gray-200/30 hover:bg-gray-50 hover:ring-2 hover:ring-gray-300/60",
          containerClassName,
        )}
        title={upload.title}
      >
        {collaborationIcon}
        {iconContainer}
        {descriptionText}
      </button>
    )
  }

  return (
    <div className={twJoin("relative cursor-default", containerClassName)}>
      {collaborationIcon}
      {iconContainer}
      {descriptionText}
    </div>
  )
}
