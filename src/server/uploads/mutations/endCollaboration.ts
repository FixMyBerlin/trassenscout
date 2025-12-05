import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getLuckyCloudArchivePath } from "@/src/server/luckycloud/_utils/folders"
import { deleteShares } from "@/src/server/luckycloud/api/deleteShares"
import { downloadFileFromLuckyCloud } from "@/src/server/luckycloud/api/downloadFile"
import { moveFile } from "@/src/server/luckycloud/api/moveFile"
import { getAwsSdkS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const EndCollaborationSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(EndCollaborationSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }, ctx: Ctx) => {
    // Get upload
    const upload = await db.upload.findFirstOrThrow({
      where: { id },
      select: {
        id: true,
        externalUrl: true,
        collaborationUrl: true,
        collaborationPath: true,
        mimeType: true,
      },
    })

    if (!upload.collaborationUrl || !upload.collaborationPath) {
      throw new Error("Upload does not have a collaboration URL")
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
      const archivePath = getLuckyCloudArchivePath(projectSlug)
      archivPath = `${archivePath}/${filename}`
      await moveFile(filePath, archivPath)
    } catch (error) {
      console.warn("Failed to delete shares or move file to ARCHIVE:", error)
    }
    const updatedUpload = await db.upload.update({
      where: { id },
      data: {
        collaborationUrl: null,
        collaborationPath: archivPath,
        updatedById: ctx.session.userId,
      },
    })

    return updatedUpload
  },
)
