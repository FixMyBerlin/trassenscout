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
import { CreateSurveyResponseCommentSchema } from "../schemas"

const Schema = ProjectSlugRequiredSchema.merge(CreateSurveyResponseCommentSchema)

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ surveyResponseId, body, projectSlug }, ctx: Ctx) => {
    const { session } = ctx

    const result = await db.surveyResponseComment.create({
      data: { surveyResponseId, body, userId: session.userId! },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Beteiligungs-Beitrag kommentiert`,
      userId: ctx.session.userId,
      projectSlug,
      surveyResponseId: surveyResponseId,
    })
    return result
  },
)
