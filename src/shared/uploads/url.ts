import { S3_BUCKET, S3_REGION } from "./config"

/**
 * Constructs the S3 public URL for a given object key
 * @param key - The S3 object key (e.g., "uploads/project/file.jpg")
 * @returns The full S3 URL (e.g., "https://trassenscout.s3.eu-central-1.amazonaws.com/uploads/project/file.jpg")
 */
export function getS3Url(key: string) {
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`
}

/**
 * Extracts the S3 object key from an external S3 URL
 * @param externalUrl - The full S3 URL (e.g., "https://trassenscout.s3.eu-central-1.amazonaws.com/uploads/project/file.jpg")
 * @returns The S3 object key (e.g., "uploads/project/file.jpg")
 */
export function getS3KeyFromUrl(externalUrl: string) {
  const { pathname } = new URL(externalUrl)
  return pathname.substring(1)
}

/**
 * Extracts the filename from an S3 URL or S3 key
 * @param s3UrlOrKey - Either a full S3 URL or an S3 object key (e.g., "uploads/project/file.jpg")
 * @returns The filename (e.g., "file.jpg")
 */
export function getFilenameFromS3(s3UrlOrKey: string) {
  // If it's a URL, extract the key first
  const key = s3UrlOrKey.startsWith("http") ? getS3KeyFromUrl(s3UrlOrKey) : s3UrlOrKey
  // Get the last part of the key (the filename)
  return key.split("/").at(-1) || ""
}
