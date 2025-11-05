import { Upload } from "@prisma/client"

export const uploadUrl = (upload: Upload | Pick<Upload, "id" | "externalUrl">) => {
  return `/api/uploads/${upload.id}/${upload.externalUrl.split("/").at(-1)}`
}
