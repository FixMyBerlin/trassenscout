import { Upload } from "@/src/prisma/generated/browser"

export const uploadUrl = (upload: Pick<Upload, "id">, projectSlug: string) => {
  return `/api/${projectSlug}/uploads/${upload.id}`
}

export const uploadDownloadUrl = (upload: Pick<Upload, "id">, projectSlug: string) => {
  return `${uploadUrl(upload, projectSlug)}?download`
}
