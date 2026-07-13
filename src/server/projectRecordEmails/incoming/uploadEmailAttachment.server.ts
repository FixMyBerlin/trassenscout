import { PutObjectCommand } from "@aws-sdk/client-s3"
import { generateS3Key } from "@/src/server/uploads/_utils/keys"
import { getAwsSdkS3Client } from "@/src/server/uploads/_utils/s3Client.server"
import { uploadSource } from "@/src/server/uploads/_utils/sources"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getS3Url } from "@/src/shared/uploads/url"

type UploadEmailAttachmentParams = {
  attachment: { filename: string; contentType: string; size: number; content: Buffer }
  projectSlug: string
  projectRecordEmailId: number
}

export async function uploadEmailAttachment({
  attachment,
  projectSlug,
  projectRecordEmailId,
}: UploadEmailAttachmentParams) {
  const s3Client = getAwsSdkS3Client()
  const key = generateS3Key(projectSlug, attachment.filename)
  const url = getS3Url(key)

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
