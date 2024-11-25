import db from "@/db"
import { AllowedSurveySlugsSchema } from "@/src/survey-public/utils/allowedSurveySlugs"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const Schema = AllowedSurveySlugsSchema.merge(z.object({ deleteIds: z.array(z.number()) }))

export default resolver.pipe(
  resolver.zod(Schema),
  resolver.authorize("ADMIN"),
  async ({ deleteIds, slug }) => {
    await db.surveyResponseTopicsOnSurveyResponses.deleteMany({
      where: { surveyResponse: { id: { in: deleteIds } } },
    })
    await db.surveyResponse.deleteMany({ where: { id: { in: deleteIds } } })
    await db.surveySession.deleteMany({
      where: { responses: { some: { id: { in: deleteIds } } } },
    })
  },
)
