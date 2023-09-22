import { Upload } from "@prisma/client"

export const uploadUrl = (upload: Upload) => {
  return `/api/uploads/${upload.id}/${upload.externalUrl.split("/").at(-1)}`
}
