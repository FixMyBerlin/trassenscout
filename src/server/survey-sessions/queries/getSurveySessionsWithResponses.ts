import db, { SurveyResponseStateEnum } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const Schema = ProjectSlugRequiredSchema.merge(
  z.object({
    surveyId: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(Schema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ surveyId }) => {
    const surveySessions = await db.surveySession.findMany({
      where: { surveyId },
      include: {
        responses: {
          where: { state: SurveyResponseStateEnum.SUBMITTED },
          include: {
            surveyResponseTopics: true,
            surveyResponseComments: { include: { author: true } },
          },
        },
      },
    })
    return surveySessions
  },
)
