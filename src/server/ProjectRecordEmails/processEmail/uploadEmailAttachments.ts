import { uploadEmailAttachment } from "@/src/server/ProjectRecordEmails/processEmail/uploadEmailAttachment"
import db from "db"

type ProcessEmailAttachmentsParams = {
  attachments: { filename: string; contentType: string; size: number; content: Buffer }[]
  projectId: number
  projectRecordEmailId: number
}

export const uploadEmailAttachments = async ({
  attachments,
  projectId,
  projectRecordEmailId,
}: ProcessEmailAttachmentsParams) => {
  // Upload attachments to S3 and create Upload records (DISABLED FOR TESTING)
  const uploadPromises = attachments.map(async (attachment) => {
    console.log(`Uploading attachment: ${attachment.filename} (${attachment.size} bytes)`)

    try {
      // Upload to S3
      const uploadedFile = await uploadEmailAttachment({ attachment, projectId })

      // Create Upload record in database
      const upload = await db.upload.create({
        data: {
          title: attachment.filename,
          externalUrl: uploadedFile.url,
          projectId: projectId,
          projectRecordEmailId: projectRecordEmailId,
          mimeType: uploadedFile.contentType, // Store the MIME type from email attachment
          // tbd: summary
        },
      })

      console.log(`Created Upload record ${upload.id} for ${attachment.filename}`)
      return upload
    } catch (error) {
      console.error(`Error uploading attachment ${attachment.filename}:`, error)
      // Continue processing other attachments even if one fails
      return null
    }
  })

  const uploadResults = await Promise.all(uploadPromises)
  const createdUploads = uploadResults.filter((u) => u !== null)
  console.log(`Successfully processed ${createdUploads.length}/${attachments.length} attachments`)

  // Get the IDs of created uploads to connect to the projectRecord
  const uploadIds = createdUploads.map((upload) => upload!.id)

  return uploadIds
}
