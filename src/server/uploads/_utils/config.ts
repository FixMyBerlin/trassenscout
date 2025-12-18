// Static S3 configuration
export const S3_BUCKET = "trassenscout"
export const S3_REGION = "eu-central-1"
export const S3_MAX_FILE_SIZE_BYTES = 1024 * 1024 * 50 // 50 MB
export const S3_MAX_FILES = 10

// Helper to format file size for display
export const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(2)} MB`
}
