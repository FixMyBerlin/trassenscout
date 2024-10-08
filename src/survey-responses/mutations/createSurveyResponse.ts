import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { SurveyResponseSourceEnum } from "@prisma/client"
import { z } from "zod"

const CreateSurveyResponseSchema = z.object({
  surveySessionId: z.number(),
  surveyPart: z.number(),
  data: z.string(),
  source: z.nativeEnum(SurveyResponseSourceEnum),
  status: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateSurveyResponseSchema),
  async (input) => await db.surveyResponse.create({ data: input }),
)
