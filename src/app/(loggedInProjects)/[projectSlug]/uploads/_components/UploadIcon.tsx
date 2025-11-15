"use client"

import { getFileIcon } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileIcon"
import {
  getFileTypeLabel,
  isImage,
} from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import {
  UPLOAD_SIZES,
  UploadSize,
} from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadSizes"
import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { Upload } from "@prisma/client"
import Image from "next/image"
import { useState } from "react"
import { twJoin } from "tailwind-merge"

type Props = {
  upload: Upload | Pick<Upload, "id" | "mimeType" | "title" | "externalUrl">
  projectSlug: string
  size: UploadSize
}

export const UploadIcon = ({ upload, projectSlug, size }: Props) => {
  const [imageError, setImageError] = useState(false)
  const FileIcon = getFileIcon(upload.mimeType)
  const fileType = getFileTypeLabel(upload.mimeType) || "Unbekannt"
  const sizeConfig = UPLOAD_SIZES[size]

  if (isImage(upload.mimeType) && !imageError) {
    return (
      <Image
        src={uploadUrl(upload, projectSlug)}
        alt={fileType}
        width={sizeConfig.iconPx}
        height={sizeConfig.iconPx}
        className={twJoin(sizeConfig.iconSize, "rounded object-cover")}
        onError={() => setImageError(true)}
      />
    )
  }

  return <FileIcon className={twJoin(sizeConfig.iconSize, "text-gray-500")} title={fileType} />
}
