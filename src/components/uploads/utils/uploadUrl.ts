import { Upload } from "@/src/prisma/generated/browser"

export const uploadUrl = (
  upload: Upload | Pick<Upload, "id" | "externalUrl">,
  projectSlug: string,
) => {
  return `/api/${projectSlug}/uploads/${upload.id}`
}

export const uploadDownloadUrl = (
  upload: Upload | Pick<Upload, "id" | "externalUrl">,
  projectSlug: string,
) => {
  return `${uploadUrl(upload, projectSlug)}?download`
}
