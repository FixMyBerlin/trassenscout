import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { deleteFileFromLuckyCloud } from "@/src/server/luckycloud/api/deleteFile"
import { deleteShares } from "@/src/server/luckycloud/api/deleteShares"
import { getConfiguredS3Client } from "@/src/server/uploads/_utils/client"
import { S3_BUCKET } from "@/src/server/uploads/_utils/config"
import { getS3KeyFromUrl } from "@/src/server/uploads/_utils/url"
import { deleteObject } from "@better-upload/server/helpers"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"

const DeleteUploadSchema = ProjectSlugRequiredSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(DeleteUploadSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }) => {
    const upload = await db.upload.findFirstOrThrow({
      where: { id },
      select: {
        id: true,
        externalUrl: true,
        collaborationUrl: true,
        collaborationPath: true,
      },
    })
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

    const s3 = getConfiguredS3Client()
    await deleteObject(s3, { bucket: S3_BUCKET, key })

    return { id, projectSlug }
  },
  async ({ id, projectSlug }, ctx: Ctx) => {
    const record = await db.upload.deleteMany({ where: { id } })

    await createLogEntry({
      action: "DELETE",
      message: `Dokument gelöscht`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return record
  },
)
