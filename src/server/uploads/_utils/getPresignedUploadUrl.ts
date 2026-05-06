import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { presignGetObject } from "@better-upload/server/helpers"

const PREVIEW_URL_EXPIRES_IN_SECONDS = 60 * 10

export const getPresignedUploadUrl = async (externalUrl: string) => {
  const s3Client = getConfiguredS3Client()
  const key = getS3KeyFromUrl(externalUrl)

  return presignGetObject(s3Client, {
    bucket: S3_BUCKET,
    key,
    expiresIn: PREVIEW_URL_EXPIRES_IN_SECONDS,
  })
}
