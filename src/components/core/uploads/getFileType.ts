import { isImageMimeType } from "@/src/components/core/uploads/isImageUpload"
import { Upload } from "@/src/prisma/generated/browser"

const MIME_TO_EXTENSIONS_MAP = {
  "image/*": ["image/*"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.oasis.opendocument.text": [".odt"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.oasis.opendocument.spreadsheet": [".ods"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.oasis.opendocument.presentation": [".odp"],
  "application/acad": [".dwg"],
  "application/x-dwg": [".dwg"],
  "image/vnd.dwg": [".dwg"],
  "application/dxf": [".dxp"],
} as const

export const isSupportedMimeType = (mimeType: string | null | undefined) => {
  if (!mimeType) return false
  if (isImage(mimeType)) return true
  return mimeType in MIME_TO_EXTENSIONS_MAP
}

const isImage = (mimeType: string | null | undefined) => isImageMimeType(mimeType)

export const isPdfByMimeType = (mimeType: string | null | undefined) =>
  mimeType === "application/pdf"

export const isPdf = (upload: Pick<Upload, "mimeType" | "externalUrl">) => {
  if (upload.mimeType) return isPdfByMimeType(upload.mimeType)
  return upload.externalUrl?.toLowerCase().endsWith(".pdf") === true
}
