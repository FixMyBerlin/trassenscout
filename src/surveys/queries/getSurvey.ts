import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { allowedSurveySlogs, AllowedSurveySlugs } from "src/survey-public/utils/allowedSurveySlugs"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getSurveyProjectId from "./getSurveyProjectId"

const GetSurveySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetSurveySchema),
  authorizeProjectAdmin(getSurveyProjectId, viewerRoles),
  async ({ id }) => {
    const survey = await db.survey.findFirstOrThrow({
      where: { id },
    })
    if (allowedSurveySlogs.includes(survey.slug)) {
      throw new NotFoundError()
    }
    // Get type savety for `slug`
    return { ...survey, slug: survey.slug as AllowedSurveySlugs }
  },
)
