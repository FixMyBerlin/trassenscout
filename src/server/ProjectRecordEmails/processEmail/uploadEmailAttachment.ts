import { getClient } from "@/src/core/lib/next-s3-upload/src/utils/client"
import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import { sanitizeKey, uuid } from "@/src/core/lib/next-s3-upload/src/utils/keys"
import { PutObjectCommand } from "@aws-sdk/client-s3"

type UploadEmailAttachmentParams = {
  attachment: { filename: string; contentType: string; size: number; content: Buffer }
  projectId: number
}

export const uploadEmailAttachment = async ({
  attachment,
  projectId,
}: UploadEmailAttachmentParams) => {
  const config = getConfig()
  const s3Client = getClient()

  // Generate a unique key for the file using the same pattern as next-s3-upload
  // Format: {rootFolder}/projectRecord-emails/{projectId}/{uuid}/{sanitized-filename}
  const sanitizedFilename = sanitizeKey(attachment.filename)
  const key = `${config.rootFolder}/projectRecord-emails/${projectId}/${uuid()}/${sanitizedFilename}`

  // Use the same PutObjectCommand structure as the s3-upload.ts presigned strategy
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: attachment.content,
    ContentType: attachment.contentType,
    ContentLength: attachment.size,
    CacheControl: "max-age=630720000", // Same cache control as next-s3-upload
  })

  await s3Client.send(command)

  // Construct the S3 URL - same format as other uploads
  const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`

  return {
    filename: attachment.filename,
    url,
    contentType: attachment.contentType,
    size: attachment.size,
    key,
  }
}
