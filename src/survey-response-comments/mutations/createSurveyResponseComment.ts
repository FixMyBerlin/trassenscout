import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"

import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { CreateSurveyResponseCommentSchema } from "../schemas"

const Schema = ProjectSlugRequiredSchema.merge(CreateSurveyResponseCommentSchema)

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ surveyResponseId, body }, ctx) => {
    const { session } = ctx

    const result = await db.surveyResponseComment.create({
      data: { surveyResponseId, body, userId: session.userId! },
    })
    return result
  },
)
