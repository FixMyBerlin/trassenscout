import { Upload } from "@/src/prisma/generated/browser"

export const uploadUrl = (
  upload: Upload | Pick<Upload, "id" | "externalUrl">,
  projectSlug: string,
) => {
  return `/api/${projectSlug}/uploads/${upload.id}`
}
