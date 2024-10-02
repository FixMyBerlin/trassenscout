import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import {
  allowedSurveySlugs,
  AllowedSurveySlugs,
} from "@/src/survey-public/utils/allowedSurveySlugs"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"

const GetSurveySchema = ProjectSlugRequiredSchema.merge(
  z.object({
    // This accepts type of undefined, but is required at runtime
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }) => {
    const survey = await db.survey.findFirstOrThrow({
      where: { id },
    })
    if (!allowedSurveySlugs.includes(survey.slug)) {
      throw new NotFoundError()
    }
    // Get type savety for `slug`
    return { ...survey, slug: survey.slug as AllowedSurveySlugs }
  },
)
