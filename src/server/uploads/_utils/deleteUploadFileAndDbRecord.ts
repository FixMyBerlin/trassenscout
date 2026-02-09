import db from "@/db"
import { deleteFileFromLuckyCloud } from "@/src/server/luckycloud/api/deleteFile"
import { deleteShares } from "@/src/server/luckycloud/api/deleteShares"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { deleteObject } from "@better-upload/server/helpers"
import { NotFoundError } from "blitz"

type UploadForDeletion = {
  id: number
  externalUrl: string
  collaborationUrl: string | null
  collaborationPath: string | null
}

/**
 * Deletes an upload file from S3 (and Luckycloud if applicable) and then deletes the DB record.
 * Includes environment root folder safety check to prevent accidental deletion of production files.
 *
 * @param upload - Upload record with id, externalUrl, collaborationUrl, and collaborationPath
 * @throws NotFoundError if the file doesn't belong to the current environment's root folder
 * @throws Error if file deletion fails (fail-fast behavior)
 */
export async function deleteUploadFileAndDbRecord(upload: UploadForDeletion): Promise<void> {
  const key = getS3KeyFromUrl(upload.externalUrl)
  const rootFolder = process.env.S3_UPLOAD_ROOTFOLDER

  // Security: Only allow deletion of files in the current environment's root folder
  // This prevents accidentally deleting production files when using a copied production database locally
  if (!key.startsWith(rootFolder)) {
    throw new NotFoundError(
      `File does not belong to current environment (expected root folder: ${rootFolder})`,
    )
  }

  // Delete from Luckycloud if file is in collaboration mode or archived
  if (upload.collaborationPath) {
    try {
      // If in active collaboration, delete shares first
      if (upload.collaborationUrl) {
        await deleteShares(upload.collaborationPath)
      }
      // Delete the file from Luckycloud (works for both active and archived files)
      await deleteFileFromLuckyCloud(upload.collaborationPath)
    } catch (error) {
      // Log but don't fail - file might already be deleted in Luckycloud
      console.warn("Failed to delete file from Luckycloud:", error)
    }
  }

  // Delete from S3 (fail-fast: if this fails, we don't delete the DB record)
  const s3 = getConfiguredS3Client()
  await deleteObject(s3, { bucket: S3_BUCKET, key })

  // Delete DB record
  await db.upload.deleteMany({ where: { id: upload.id } })
}
