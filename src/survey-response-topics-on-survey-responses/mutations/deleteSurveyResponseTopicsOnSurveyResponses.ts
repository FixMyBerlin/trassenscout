import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteSurveyResponseTopicsOnSurveyResponses = z.object({
  surveyResponseId: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteSurveyResponseTopicsOnSurveyResponses),
  async ({ surveyResponseId }) => {
    return await db.surveyResponseTopicsOnSurveyResponses.deleteMany({
      where: { surveyResponseId },
    })
  },
)
