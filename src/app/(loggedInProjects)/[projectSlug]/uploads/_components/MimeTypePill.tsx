import clsx from "clsx"

type MimeTypePillProps = {
  mimeType: string | null
}

// Map MIME types to user-friendly labels
const getMimeTypeLabel = (mimeType: string): string => {
  // if (!mimeType) return "DATEI"

  const labels: Record<string, string> = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG",
    "image/jpg": "JPG",
    "image/png": "PNG",
    "image/gif": "GIF",
    "image/webp": "WEBP",
    "image/svg+xml": "SVG",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "application/vnd.oasis.opendocument.text": "ODT",
    "application/vnd.oasis.opendocument.spreadsheet": "ODS",
    "application/vnd.oasis.opendocument.presentation": "ODP",
    "application/zip": "ZIP",
    "application/x-zip-compressed": "ZIP",
    "text/plain": "TXT",
    "text/csv": "CSV",
    "video/mp4": "MP4",
    "video/quicktime": "MOV",
    "audio/mpeg": "MP3",
    "audio/wav": "WAV",
  }

  // Return mapped label or extract subtype and uppercase it
  return labels[mimeType] || mimeType.split("/")[1]?.toUpperCase() || "FILE"
}

export const MimeTypePill = ({ mimeType }: MimeTypePillProps) => {
  if (!mimeType) return

  const label = getMimeTypeLabel(mimeType)

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500",
      )}
    >
      {label}
    </span>
  )
}
