import { Upload } from "@/db"

export const validatePdfFile = ({ upload }: { upload: Upload }) => {
  const isPdf =
    upload.externalUrl.toLowerCase().endsWith(".pdf") || upload.title.toLowerCase().endsWith(".pdf")

  if (!isPdf) {
    throw new Error("Only PDF files are supported for summarization")
  }
}
