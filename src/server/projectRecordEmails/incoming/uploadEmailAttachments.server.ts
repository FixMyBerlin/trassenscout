import db from "@/src/server/db.server"
import { formatFileSize, S3_MAX_FILE_SIZE_BYTES } from "@/src/shared/uploads/config"
import { uploadEmailAttachment } from "./uploadEmailAttachment.server"

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

export async function uploadEmailAttachments({
  attachments,
  projectId,
  projectSlug,
  projectRecordEmailId,
}: ProcessEmailAttachmentsParams) {
  const skippedAttachments: SkippedAttachment[] = []

  const uploadPromises = attachments.map(async (attachment) => {
    console.log(`Processing attachment: ${attachment.filename} (${attachment.size} bytes)`)

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
      const uploadedFile = await uploadEmailAttachment({
        attachment,
        projectSlug,
        projectRecordEmailId,
      })

      const upload = await db.upload.create({
        data: {
          title: attachment.filename,
          externalUrl: uploadedFile.url,
          projectId,
          projectRecordEmailId,
          mimeType: uploadedFile.contentType,
          fileSize: attachment.size,
          createdById: null,
          updatedById: null,
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
      return null
    }
  })

  const uploadResults = await Promise.all(uploadPromises)
  const createdUploads = uploadResults.filter((upload) => upload !== null)
  console.log(
    `Successfully processed ${createdUploads.length}/${attachments.length} attachments${skippedAttachments.length > 0 ? `, skipped ${skippedAttachments.length}` : ""}`,
  )

  const uploadIds = createdUploads.map((upload) => upload.id)

  return {
    uploadIds,
    skippedAttachments,
  }
}
