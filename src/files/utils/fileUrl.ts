import { File } from "@prisma/client"

export const fileUrl = (file: File) => {
  return `/api/files/${file.id}/${file.externalUrl.split("/").at(-1)}`
}
