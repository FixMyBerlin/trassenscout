import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SurveyResponseSchema } from "../schema"

const UpdateSurveyResponseSchema = ProjectSlugRequiredSchema.merge(
  SurveyResponseSchema.merge(z.object({ id: z.number() })).omit({
    // We do not want to update this data, it should stay as is
    data: true,
    surveySessionId: true,
    surveyPart: true,
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSurveyResponseSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, ...data }) => {
    return await db.surveyResponse.update({
      where: { id },
      data,
    })
  },
)
