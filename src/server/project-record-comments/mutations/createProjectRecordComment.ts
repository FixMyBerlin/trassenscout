import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"

import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { CreateProjectRecordCommentSchema } from "../schemas"

const Schema = ProjectSlugRequiredSchema.merge(CreateProjectRecordCommentSchema)

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectRecordId, body, projectSlug }, ctx: Ctx) => {
    const { session } = ctx

    const result = await db.projectRecordComment.create({
      data: { projectRecordId, body, userId: session.userId! },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Protokolleintrag kommentiert`,
      userId: ctx.session.userId,
      projectSlug,
      projectRecordId,
    })
    return result
  },
)
