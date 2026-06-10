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
}

export const UploadIcon = ({ upload, projectSlug, size }: Props) => {
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
          "pointer-events-none cursor-default rounded object-contain select-none",
        )}
        draggable={false}
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <Tooltip content={fileType}>
      <FileTypeIcon
        mimeType={upload.mimeType}
        className={twJoin(sizeConfig.iconSize, "rounded-lg border border-gray-200 text-gray-500")}
      />
    </Tooltip>
  )
}
