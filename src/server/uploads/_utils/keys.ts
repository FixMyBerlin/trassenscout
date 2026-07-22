import { S3_BUCKET, S3_REGION } from "@/src/shared/uploads/config"
import { getS3KeyFromUrl } from "@/src/shared/uploads/url"

const uuid = () => crypto.randomUUID()

export const sanitizeKey = (value: string) => {
  const SAFE_CHARACTERS = /[^0-9a-zA-Z!_\\.\\*'\\(\\)\\\-/]/g
  return value.replace(SAFE_CHARACTERS, " ").replace(/\s+/g, "-")
}

export const generateS3Key = (projectSlug: string, filename: string) => {
  const sanitizedFilename = sanitizeKey(filename)
  return `${getProjectUploadS3KeyPrefix(projectSlug)}${uuid()}/${sanitizedFilename}` as const
}

export const getProjectUploadS3KeyPrefix = (projectSlug: string) => {
  const rootFolder = process.env.S3_UPLOAD_ROOTFOLDER
  if (!rootFolder) {
    throw new Error("Missing S3_UPLOAD_ROOTFOLDER")
  }
  return `${rootFolder}/${projectSlug}/` as const
}

export const isProjectUploadS3Url = (externalUrl: string, projectSlug: string) => {
  try {
    const url = new URL(externalUrl)
    if (url.protocol !== "https:") return false
    if (url.host !== `${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`) return false
    return getS3KeyFromUrl(externalUrl).startsWith(getProjectUploadS3KeyPrefix(projectSlug))
  } catch {
    return false
  }
}

/**
 * Generates a unique filename by adding a UUID to the base name
 * @param originalFilename - The original filename (e.g., "document.pdf")
 * @returns A unique filename (e.g., "document_a1b2c3d4.pdf")
 */
export const generateUniqueFilename = (originalFilename: string) => {
  const fileExtension = originalFilename.includes(".")
    ? originalFilename.substring(originalFilename.lastIndexOf("."))
    : ""
  const baseName = originalFilename.includes(".")
    ? originalFilename.substring(0, originalFilename.lastIndexOf("."))
    : originalFilename

  const uniqueId = uuid().substring(0, 8)
  return `${baseName}_${uniqueId}${fileExtension}`
}
