import { getObject } from "@better-upload/server/helpers"
import { isPdfByMimeType } from "@/src/components/core/uploads/getFileType"
import { isDev } from "@/src/components/core/utils/isEnv"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/s3Client.server"
import { S3_BUCKET, S3_MAX_FILE_SIZE_BYTES } from "@/src/shared/uploads/config"
import { getS3KeyFromUrl } from "@/src/shared/uploads/url"

export async function fetchPdfFromS3({ externalUrl }: { externalUrl: string }) {
  if (isDev) {
    console.log("Fetching PDF from S3...")
  }

  const key = getS3KeyFromUrl(externalUrl)
  const s3Client = getConfiguredS3Client()
  const response = await getObject(s3Client, { bucket: S3_BUCKET, key })

  if (!isPdfByMimeType(response.contentType)) {
    throw new Error("File is not a PDF")
  }

  if (response.contentLength && response.contentLength > S3_MAX_FILE_SIZE_BYTES) {
    throw new Error("File too large for processing")
  }

  return Buffer.from(await response.blob.arrayBuffer())
}
