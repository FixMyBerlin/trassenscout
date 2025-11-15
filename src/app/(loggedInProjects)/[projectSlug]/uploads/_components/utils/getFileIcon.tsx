import { DocumentIcon, DocumentTextIcon, PaperClipIcon, PhotoIcon } from "@heroicons/react/20/solid"
import { getFileTypeCategory } from "./getFileType"

export const getFileIcon = (mimeType: string | null | undefined) => {
  const category = getFileTypeCategory(mimeType)

  switch (category) {
    case "image":
      return PhotoIcon
    case "pdf":
      return DocumentTextIcon
    case "document":
      return DocumentIcon
    default:
      return PaperClipIcon
  }
}
