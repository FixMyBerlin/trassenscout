import { resolver } from "@blitzjs/rpc"
import db from "db"
import { AllowedSurveySlugs } from "src/survey-public/utils/allowedSurveySlugs"
import { UpdateSurveySchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => {
    const udpatedSurvey = await db.survey.update({ where: { id }, data })
    // Get type savety for `slug`
    return { ...udpatedSurvey, slug: udpatedSurvey.slug as AllowedSurveySlugs }
  },
)
