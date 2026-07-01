import { IMAGE_EXTENSIONS, isImageMimeType } from "@/src/components/core/uploads/isImageUpload"
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

const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ...IMAGE_EXTENSIONS,
  ...Object.values(MIME_TO_EXTENSIONS_MAP)
    .flat()
    .filter((extension) => extension.startsWith("."))
    .map((extension) => extension.slice(1)),
])

const getFilenameExtension = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase()
  return extension && extension !== filename.toLowerCase() ? extension : null
}

export const isSupportedUploadFilename = (filename: string) => {
  const extension = getFilenameExtension(filename)
  if (!extension) return false
  return ALLOWED_UPLOAD_EXTENSIONS.has(extension)
}

export const isSupportedMimeType = (mimeType: string | null | undefined) => {
  if (!mimeType) return false
  // Reject SVG: it is an XML document that can embed <script>, so if opened
  // directly via the upload serve proxy (same app origin) it executes as
  // stored XSS. Raster images cannot do this.
  if (mimeType === "image/svg+xml") return false
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
