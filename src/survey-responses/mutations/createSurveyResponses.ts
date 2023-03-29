import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateSurveyResponses = z.array(
  z.object({
    surveySessionId: z.number(),
    surveyId: z.number(),
    data: z.string(),
  })
)

export default resolver.pipe(
  resolver.zod(CreateSurveyResponses),
  async (input) => await db.surveyResponse.createMany({ data: input })
)
