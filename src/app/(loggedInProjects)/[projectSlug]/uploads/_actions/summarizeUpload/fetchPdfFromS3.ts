import { isPdf } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { isDev } from "@/src/core/utils/isEnv"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { getObject } from "@better-upload/server/helpers"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const fetchPdfFromS3 = async ({ externalUrl }: { externalUrl: string }) => {
  if (isDev) {
    console.log("Fetching PDF from S3...")
  }

  const key = getS3KeyFromUrl(externalUrl)
  const s3Client = getConfiguredS3Client()
  const response = await getObject(s3Client, { bucket: S3_BUCKET, key })

  // Additional PDF validation by checking content type
  if (!isPdf(response.contentType)) {
    throw new Error("File is not a PDF")
  }

  // Check file size using S3 metadata (before downloading the full file)
  if (response.contentLength && response.contentLength > MAX_FILE_SIZE_BYTES) {
    throw new Error("File too large for processing")
  }

  // Convert blob to buffer (required by AI SDK)
  return Buffer.from(await response.blob.arrayBuffer())
}
