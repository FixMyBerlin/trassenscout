import { getAwsSdkS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { generateS3Key } from "@/src/server/uploads/_utils/keys"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import { getS3Url } from "@/src/server/uploads/_utils/url"
import { PutObjectCommand } from "@aws-sdk/client-s3"

type UploadEmailAttachmentParams = {
  attachment: { filename: string; contentType: string; size: number; content: Buffer }
  projectSlug: string
  projectRecordEmailId: number
}

export const uploadEmailAttachment = async ({
  attachment,
  projectSlug,
  projectRecordEmailId,
}: UploadEmailAttachmentParams) => {
  const s3Client = getAwsSdkS3Client()
  const key = generateS3Key(projectSlug, attachment.filename)
  const url = getS3Url(key)

  // Upload file to S3 using native AWS SDK PutObjectCommand
  // Using native SDK instead of Better Upload's putObject helper because
  // the helper doesn't properly handle Buffer uploads with Content-Length,
  // causing "NotImplemented" errors with chunked transfer encoding
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: attachment.content,
    ContentType: attachment.contentType,
    ContentLength: attachment.size,
    Metadata: {
      projectrecordemailid: String(projectRecordEmailId),
      source: uploadSource.emailAttachment,
    },
  })
  await s3Client.send(command)

  return {
    filename: attachment.filename,
    url,
    contentType: attachment.contentType,
    size: attachment.size,
    key,
  }
}
