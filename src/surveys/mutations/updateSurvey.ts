import db from "@/db"

import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { resolver } from "@blitzjs/rpc"
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
