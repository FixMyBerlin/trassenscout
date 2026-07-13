import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getObject } from "@better-upload/server/helpers"
import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { getLuckyCloudArchivePath } from "@/src/server/luckycloud/_utils/folders"
import { createShareLink } from "@/src/server/luckycloud/api/createShareLink"
import { deleteShares } from "@/src/server/luckycloud/api/deleteShares"
import { downloadFileFromLuckyCloud } from "@/src/server/luckycloud/api/downloadFile"
import { moveFile } from "@/src/server/luckycloud/api/moveFile"
import { uploadFileToLuckyCloud } from "@/src/server/luckycloud/api/uploadFile"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getFilenameFromS3, getS3KeyFromUrl } from "@/src/shared/uploads/url"
import { generateUniqueFilename } from "./_utils/keys"
import { getAwsSdkS3Client, getConfiguredS3Client } from "./_utils/s3Client.server"
import { CopyToLuckyCloudSchema, EndCollaborationSchema } from "./uploads.inputSchemas"

export { CopyToLuckyCloudSchema, EndCollaborationSchema }

export async function copyToLuckyCloud(
  headers: Headers,
  input: z.infer<typeof CopyToLuckyCloudSchema>,
) {
  const { session, projectId } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const upload = await db.upload.findFirst({
    where: { id: input.id, projectId },
    select: {
      id: true,
      externalUrl: true,
      title: true,
      collaborationUrl: true,
      collaborationPath: true,
    },
  })

  if (!upload) {
    throw new Error("Upload not found or does not belong to this project")
  }

  if (upload.collaborationUrl) {
    throw new Error("Upload already has a Kollaborations-URL")
  }

  const s3Key = getS3KeyFromUrl(upload.externalUrl)
  const s3Client = getConfiguredS3Client()
  const s3Object = await getObject(s3Client, { bucket: S3_BUCKET, key: s3Key })
  const fileBuffer = Buffer.from(await s3Object.blob.arrayBuffer())
  const originalFilename = getFilenameFromS3(upload.externalUrl)
  const uniqueFilename = generateUniqueFilename(originalFilename)
  const luckyCloudPath = await uploadFileToLuckyCloud(fileBuffer, uniqueFilename, input.projectSlug)
  const shareResult = await createShareLink(luckyCloudPath)

  return db.upload.update({
    where: { id: upload.id },
    data: {
      collaborationUrl: shareResult.shareLink,
      collaborationPath: luckyCloudPath,
      updatedById: Number(session.userId),
    },
  })
}

export async function endCollaboration(
  headers: Headers,
  input: z.infer<typeof EndCollaborationSchema>,
) {
  const { session, projectId } = await endpointAuth.projectRole(
    headers,
    input.projectSlug,
    editorRoles,
  )
  const upload = await db.upload.findFirst({
    where: { id: input.id, projectId },
    select: {
      id: true,
      externalUrl: true,
      collaborationUrl: true,
      collaborationPath: true,
      mimeType: true,
    },
  })

  if (!upload) {
    throw new Error("Upload not found or does not belong to this project")
  }

  if (!upload.collaborationUrl || !upload.collaborationPath) {
    throw new Error("Upload does not have a Kollaborations-URL")
  }

  const filePath = upload.collaborationPath
  const fileBuffer = await downloadFileFromLuckyCloud(filePath)
  const s3Key = getS3KeyFromUrl(upload.externalUrl)
  const s3Client = getAwsSdkS3Client()

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: upload.mimeType || "application/octet-stream",
    }),
  )

  let archivPath: string | null = null
  try {
    await deleteShares(filePath)
    const filename = filePath.split("/").pop() || `file_${Date.now()}`
    const archivePath = getLuckyCloudArchivePath(input.projectSlug)
    archivPath = `${archivePath}/${filename}`
    await moveFile(filePath, archivPath)
  } catch (error) {
    console.warn("Failed to delete shares or move file to ARCHIVE:", error)
  }

  return db.upload.update({
    where: { id: upload.id },
    data: {
      collaborationUrl: null,
      collaborationPath: archivPath,
      updatedById: Number(session.userId),
    },
  })
}
