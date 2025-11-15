/**
 * Mapping from MIME types to file extensions for the accept attribute
 * This is the source of truth for supported uploads
 * The accept attribute uses extensions, not MIME types directly
 */
const MIME_TO_EXTENSIONS_MAP = {
  // Images - all image types
  "image/*": ["image/*"],
  // PDF
  "application/pdf": [".pdf"],
  // Office Documents - Word
  "application/msword": [".doc"], // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], // .docx
  "application/vnd.oasis.opendocument.text": [".odt"], // .odt
  // Office Documents - Spreadsheets
  "application/vnd.ms-excel": [".xls"], // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"], // .xlsx
  "application/vnd.oasis.opendocument.spreadsheet": [".ods"], // .ods
  // Office Documents - Presentations
  "application/vnd.ms-powerpoint": [".ppt"], // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"], // .pptx
  "application/vnd.oasis.opendocument.presentation": [".odp"], // .odp
  // CAD files
  "application/acad": [".dwg"], // .dwg
  "application/x-dwg": [".dwg"], // .dwg (alternative)
  "image/vnd.dwg": [".dwg"], // .dwg (alternative)
  "application/dxf": [".dxp"], // .dxp
} as const

type SupportedMimeType = keyof typeof MIME_TO_EXTENSIONS_MAP

const SUPPORTED_MIME_TYPES = Object.keys(MIME_TO_EXTENSIONS_MAP) as SupportedMimeType[]

/**
 * Generates the accept attribute string from supported MIME types
 * This ensures the accept attribute stays in sync with SUPPORTED_MIME_TYPES
 * Iterates over SUPPORTED_MIME_TYPES and uses MIME_TO_EXTENSIONS for conversion
 */
export function getAcceptAttribute(): string {
  const acceptParts = new Set<string>()

  // Wildcard MIME types (e.g., "image/*") can be used directly
  // Specific MIME types need to be converted to extensions
  for (const mimeType of SUPPORTED_MIME_TYPES) {
    if (mimeType.endsWith("/*")) {
      acceptParts.add(mimeType)
    } else {
      for (const ext of MIME_TO_EXTENSIONS_MAP[mimeType]) {
        acceptParts.add(ext)
      }
    }
  }

  return Array.from(acceptParts).join(",")
}

export const getFileTypeCategory = (mimeType: string | null | undefined) => {
  if (!mimeType) {
    return "other"
  }

  if (mimeType.startsWith("image/")) {
    return "image"
  }

  if (mimeType === "application/pdf") {
    return "pdf"
  }

  // All other supported types are documents (Office files, CAD files)
  if (mimeType in MIME_TO_EXTENSIONS_MAP) {
    return "document"
  }

  return "other"
}

export const isImage = (mimeType: string | null | undefined) => {
  return mimeType?.startsWith("image/") ?? false
}

export const isPdf = (mimeType: string | null | undefined) => {
  return mimeType === "application/pdf"
}

/**
 * Get a short label for a mime type (for display on icons)
 */
export const getFileTypeLabel = (mimeType: string | null | undefined) => {
  if (!mimeType) {
    return null
  }

  const category = getFileTypeCategory(mimeType)

  if (category === "image") {
    return "IMG"
  }

  if (mimeType in MIME_TO_EXTENSIONS_MAP) {
    const extensions = MIME_TO_EXTENSIONS_MAP[mimeType as SupportedMimeType]
    return extensions[0].slice(1).toUpperCase()
  }

  return null
}
