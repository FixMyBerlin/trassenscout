import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"

import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { AuthorizationError } from "blitz"
import { CreateSurveyResponseCommentSchema } from "../schemas"

// do we need projectId or surveyId

export default resolver.pipe(
  resolver.zod(CreateSurveyResponseCommentSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ surveyResponseId, body }, ctx) => {
    const { session } = ctx

    if (!session.userId) {
      throw new AuthorizationError()
    }

    const result = await db.surveyResponseComment.create({
      data: { surveyResponseId, body, userId: session.userId },
    })
    return result
  },
)
