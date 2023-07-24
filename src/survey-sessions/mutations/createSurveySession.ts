import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import db from "db"

const CreateSurveySession = z.object({})

export default resolver.pipe(
  resolver.zod(CreateSurveySession),
  async (input) => await db.surveySession.create({ data: input }),
)
