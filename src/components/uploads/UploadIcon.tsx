import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { Img } from "@/src/components/shared/Img"
import { FileTypeIcon } from "@/src/components/uploads/utils/FileTypeIcon"
import { getFileTypeLabel, isImageUpload } from "@/src/components/uploads/utils/getFileType"
import { UPLOAD_SIZES, UploadSize } from "@/src/components/uploads/utils/uploadSizes"
import { uploadUrl } from "@/src/components/uploads/utils/uploadUrl"
import { Upload } from "@/src/prisma/generated/browser"

type Props = {
  upload: Upload | Pick<Upload, "id" | "mimeType" | "title" | "externalUrl">
  projectSlug: string
  size: UploadSize
  /** Bordered placeholder tile for static grid previews (e.g. modal). */
  showFrame?: boolean
}

export const UploadIcon = ({ upload, projectSlug, size, showFrame = false }: Props) => {
  const [imageError, setImageError] = useState(false)
  const fileType = getFileTypeLabel(upload.mimeType) || "Unbekannt"
  const sizeConfig = UPLOAD_SIZES[size]

  if (isImageUpload(upload) && !imageError) {
    const imageSrc = uploadUrl(upload, projectSlug)

    return (
      <Img
        src={imageSrc}
        alt={fileType}
        width={sizeConfig.iconPx}
        height={sizeConfig.iconPx}
        className={twJoin(
          sizeConfig.iconSize,
          "pointer-events-none cursor-default rounded-md object-contain select-none",
        )}
        draggable={false}
        onError={() => setImageError(true)}
      />
    )
  }

  const icon = (
    <FileTypeIcon
      mimeType={upload.mimeType}
      className={twJoin(
        size === "table" ? sizeConfig.iconSize : showFrame ? "size-20" : sizeConfig.iconSize,
        size === "table" ? "text-gray-400" : "text-gray-500",
      )}
    />
  )

  const placeholder = showFrame ? (
    <span
      className={twJoin(
        sizeConfig.iconSize,
        "inline-flex shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500",
      )}
    >
      {icon}
    </span>
  ) : (
    icon
  )

  return <Tooltip content={fileType}>{placeholder}</Tooltip>
}
