import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getLuckyCloudFolder } from "@/src/server/luckycloud/_utils/folders"
import { checkFileExists } from "@/src/server/luckycloud/api/checkFileExists"
import { createShareLink } from "@/src/server/luckycloud/api/createShareLink"
import { enableTracking } from "@/src/server/luckycloud/api/enableTracking"
import { uploadFileToLuckyCloud } from "@/src/server/luckycloud/api/uploadFile"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getFilenameFromS3, getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { getObject } from "@better-upload/server/helpers"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { v4 as uuidv4 } from "uuid"
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
    const filename = getFilenameFromS3(upload.externalUrl)

    // Generate unique filename if file already exists
    let luckyCloudPath = `/${getLuckyCloudFolder()}/${filename}`
    let finalFilename = filename

    if (await checkFileExists(luckyCloudPath)) {
      // Add UUID to filename to make it unique
      const fileExtension = filename.includes(".")
        ? filename.substring(filename.lastIndexOf("."))
        : ""
      const baseName = filename.includes(".")
        ? filename.substring(0, filename.lastIndexOf("."))
        : filename
      const uuid = uuidv4().substring(0, 8)
      finalFilename = `${baseName}_${uuid}${fileExtension}`
      luckyCloudPath = `/${getLuckyCloudFolder()}/${finalFilename}`
    }

    // Upload to Lucky Cloud
    await uploadFileToLuckyCloud(fileBuffer, finalFilename)

    // Create share link with edit permissions
    const shareResult = await createShareLink(luckyCloudPath)

    // Enable tracking
    await enableTracking(luckyCloudPath)

    // Update upload with collaboration URL and path
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
