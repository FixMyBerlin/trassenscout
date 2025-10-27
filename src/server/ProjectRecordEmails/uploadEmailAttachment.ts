import { getClient } from "@/src/core/lib/next-s3-upload/src/utils/client"
import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import { sanitizeKey, uuid } from "@/src/core/lib/next-s3-upload/src/utils/keys"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { ParsedEmailAttachment } from "./parseEmail"

export interface UploadedAttachment {
  filename: string
  url: string
  contentType: string
  size: number
  key: string
}

/**
 * Uploads an email attachment to S3 using the same mechanism as next-s3-upload
 * This follows the same pattern as the s3-upload.ts API route for consistency
 * @param attachment - The parsed email attachment
 * @param projectId - The project ID for organizing uploads
 * @returns Information about the uploaded file including its S3 URL
 */
export async function uploadEmailAttachment(
  attachment: ParsedEmailAttachment,
  projectId: number,
): Promise<UploadedAttachment> {
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
