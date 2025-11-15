import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import { Upload } from "@prisma/client"

export const uploadUrl = (
  upload: Upload | Pick<Upload, "id" | "externalUrl">,
  projectSlug: string,
) => {
  const filename = getFilenameFromS3(upload.externalUrl)
  return `/api/${projectSlug}/uploads/${upload.id}/${filename}`
}
