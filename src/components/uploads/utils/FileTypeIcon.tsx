import { DocumentIcon, DocumentTextIcon, PaperClipIcon, PhotoIcon } from "@heroicons/react/20/solid"
import { getFileTypeCategory } from "./getFileType"

type Props = {
  mimeType: string | null | undefined
  className?: string
}

export function FileTypeIcon({ mimeType, className }: Props) {
  const category = getFileTypeCategory(mimeType)

  switch (category) {
    case "image":
      return <PhotoIcon className={className} />
    case "pdf":
      return <DocumentTextIcon className={className} />
    case "document":
      return <DocumentIcon className={className} />
    case "other":
      return <PaperClipIcon className={className} />
  }
}
