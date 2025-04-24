import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3"
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
    const upload = await db.upload.findFirstOrThrow({ where: { id } })
    const { hostname, pathname } = new URL(upload.externalUrl)
    const isAws = hostname.endsWith("amazonaws.com")
    if (!isAws) throw new NotFoundError()

    const { accessKeyId, secretAccessKey, region } = getConfig()
    const s3Client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region,
    })
    const command = new DeleteObjectCommand({
      Bucket: hostname.split(".")[0],
      Key: pathname.substring(1),
    })
    await s3Client.send(command)

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
