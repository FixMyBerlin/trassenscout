import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const CreateSurveyResponse = z.object({
  surveySessionId: z.number(),
  surveyId: z.number(),
  data: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateSurveyResponse),
  async (input) => await db.surveyResponse.create({ data: input }),
)
