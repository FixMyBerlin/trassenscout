import { Upload } from "@/db"

export const validatePdfFile = ({ upload }: { upload: Upload }) => {
  // Check stored mimeType first (most reliable if available)
  if (upload.mimeType) {
    return upload.mimeType === "application/pdf"
  }
  // tbd what do we do with legacy uploads without mimeType?
  // Fallback to checking URL and title (legacy uploads without mimeType)
  return (
    upload.externalUrl.toLowerCase().endsWith(".pdf") || upload.title.toLowerCase().endsWith(".pdf")
  )
}
