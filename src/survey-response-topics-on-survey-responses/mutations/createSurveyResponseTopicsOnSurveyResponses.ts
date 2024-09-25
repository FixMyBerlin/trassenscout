import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { SurveyResponseTopicsOnSurveyResponsesSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(SurveyResponseTopicsOnSurveyResponsesSchema),
  async (input) => {
    return await db.surveyResponseTopicsOnSurveyResponses.create({ data: input })
  },
)
