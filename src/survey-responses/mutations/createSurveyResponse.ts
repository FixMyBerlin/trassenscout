import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateSurveyResponse = z.object({
  surveySessionId: z.number(),
  surveyPart: z.number(),
  data: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateSurveyResponse),
  async (input) => await db.surveyResponse.create({ data: input }),
)
