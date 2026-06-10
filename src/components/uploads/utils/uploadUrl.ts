import { Upload } from "@/src/prisma/generated/browser"
import { getFilenameFromS3 } from "@/src/shared/uploads/url"

export const uploadUrl = (
  upload: Upload | Pick<Upload, "id" | "externalUrl">,
  projectSlug: string,
) => {
  const filename = getFilenameFromS3(upload.externalUrl)
  return `/api/${projectSlug}/uploads/${upload.id}/${filename}`
}
