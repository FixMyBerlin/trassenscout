import { uploadEmailAttachment } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/uploadEmailAttachment"
import { formatFileSize, S3_MAX_FILE_SIZE_BYTES } from "@/src/server/uploads/_utils/config"
import db from "db"

type ProcessEmailAttachmentsParams = {
  attachments: { filename: string; contentType: string; size: number; content: Buffer }[]
  projectId: number
  projectSlug: string
  projectRecordEmailId: number
}

type SkippedAttachment = {
  filename: string
  size: number
  reason: string
}

export const uploadEmailAttachments = async ({
  attachments,
  projectId,
  projectSlug,
  projectRecordEmailId,
}: ProcessEmailAttachmentsParams) => {
  const skippedAttachments: SkippedAttachment[] = []

  // Upload attachments to S3 and create Upload records (DISABLED FOR TESTING)
  const uploadPromises = attachments.map(async (attachment) => {
    console.log(`Processing attachment: ${attachment.filename} (${attachment.size} bytes)`)

    // Check file size limit
    if (attachment.size > S3_MAX_FILE_SIZE_BYTES) {
      const reason = `Datei zu groß (${formatFileSize(attachment.size)}). Maximum: ${formatFileSize(S3_MAX_FILE_SIZE_BYTES)}`
      console.warn(`Skipping attachment ${attachment.filename}: ${reason}`)
      skippedAttachments.push({
        filename: attachment.filename,
        size: attachment.size,
        reason,
      })
      return null
    }

    try {
      // Upload to S3
      const uploadedFile = await uploadEmailAttachment({
        attachment,
        projectSlug,
        projectRecordEmailId,
      })

      // Create Upload record in database
      // Email attachments are system-created, so createdById and updatedById are null
      const upload = await db.upload.create({
        data: {
          title: attachment.filename,
          externalUrl: uploadedFile.url,
          projectId: projectId,
          projectRecordEmailId: projectRecordEmailId,
          mimeType: uploadedFile.contentType, // Store the MIME type from email attachment
          fileSize: attachment.size,
          createdById: null, // System-created via email
          updatedById: null, // System-created via email
          // tbd: summary
        },
      })

      console.log(`Created Upload record ${upload.id} for ${attachment.filename}`)
      return upload
    } catch (error) {
      console.error(`Error uploading attachment ${attachment.filename}:`, error)
      const reason = `Upload-Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`
      skippedAttachments.push({
        filename: attachment.filename,
        size: attachment.size,
        reason,
      })
      // Continue processing other attachments even if one fails
      return null
    }
  })

  const uploadResults = await Promise.all(uploadPromises)
  const createdUploads = uploadResults.filter((u) => u !== null)
  console.log(
    `Successfully processed ${createdUploads.length}/${attachments.length} attachments${skippedAttachments.length > 0 ? `, skipped ${skippedAttachments.length}` : ""}`,
  )

  // Get the IDs of created uploads to connect to the projectRecord
  const uploadIds = createdUploads.map((upload) => upload!.id)

  return {
    uploadIds,
    skippedAttachments,
  }
}
