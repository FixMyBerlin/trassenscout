import { v4 as uuidv4 } from "uuid"

export const uuid = () => uuidv4()

export const sanitizeKey = (value: string) => {
  const SAFE_CHARACTERS = /[^0-9a-zA-Z!_\\.\\*'\\(\\)\\\-/]/g
  return value.replace(SAFE_CHARACTERS, " ").replace(/\s+/g, "-")
}

export const generateS3Key = (projectSlug: string, filename: string) => {
  const rootFolder = process.env.S3_UPLOAD_ROOTFOLDER
  const sanitizedFilename = sanitizeKey(filename)
  return `${rootFolder}/${projectSlug}/${uuid()}/${sanitizedFilename}` as const
}
