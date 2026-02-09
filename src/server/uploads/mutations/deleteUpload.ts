import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
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

    await deleteUploadFileAndDbRecord(upload)

    return { id, projectSlug }
  },
  async ({ id, projectSlug }, ctx: Ctx) => {
    await createLogEntry({
      action: "DELETE",
      message: `Dokument gelöscht`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return { id, projectSlug }
  },
)
