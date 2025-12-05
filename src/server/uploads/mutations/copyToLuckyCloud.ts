import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { createShareLink } from "@/src/server/luckycloud/api/createShareLink"
import { uploadFileToLuckyCloud } from "@/src/server/luckycloud/api/uploadFile"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { generateUniqueFilename } from "@/src/server/uploads/_utils/keys"
import { getFilenameFromS3, getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { getObject } from "@better-upload/server/helpers"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CopyToLuckyCloudSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(CopyToLuckyCloudSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }, ctx: Ctx) => {
    // Get upload
    const upload = await db.upload.findFirstOrThrow({
      where: { id },
      select: {
        id: true,
        externalUrl: true,
        title: true,
        collaborationUrl: true,
        collaborationPath: true,
      },
    })

    if (upload.collaborationUrl) {
      throw new Error("Upload already has a collaboration URL")
    }

    // Download file from S3
    const s3Key = getS3KeyFromUrl(upload.externalUrl)
    const s3Client = getConfiguredS3Client()
    const s3Object = await getObject(s3Client, { bucket: S3_BUCKET, key: s3Key })

    const fileBuffer = Buffer.from(await s3Object.blob.arrayBuffer())
    const originalFilename = getFilenameFromS3(upload.externalUrl)

    const uniqueFilename = generateUniqueFilename(originalFilename)
    const luckyCloudPath = await uploadFileToLuckyCloud(fileBuffer, uniqueFilename, projectSlug)
    const shareResult = await createShareLink(luckyCloudPath)
    const updatedUpload = await db.upload.update({
      where: { id },
      data: {
        collaborationUrl: shareResult.shareLink,
        collaborationPath: luckyCloudPath,
        updatedById: ctx.session.userId,
      },
    })

    return updatedUpload
  },
)
