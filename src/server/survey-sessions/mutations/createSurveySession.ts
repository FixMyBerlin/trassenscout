import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CreateSurveySession = z.object({
  surveyId: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateSurveySession),
  async (input) => await db.surveySession.create({ data: input, select: { id: true } }),
)
