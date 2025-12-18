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

/**
 * Generates a unique filename by adding a UUID to the base name
 * @param originalFilename - The original filename (e.g., "document.pdf")
 * @returns A unique filename (e.g., "document_a1b2c3d4.pdf")
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const fileExtension = originalFilename.includes(".")
    ? originalFilename.substring(originalFilename.lastIndexOf("."))
    : ""
  const baseName = originalFilename.includes(".")
    ? originalFilename.substring(0, originalFilename.lastIndexOf("."))
    : originalFilename

  const uniqueId = uuid().substring(0, 8)
  return `${baseName}_${uniqueId}${fileExtension}`
}
