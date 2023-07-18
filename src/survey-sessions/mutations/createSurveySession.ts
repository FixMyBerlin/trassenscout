import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateSurveySession = z.object({})

export default resolver.pipe(
  resolver.zod(CreateSurveySession),
  async (input) => await db.surveySession.create({ data: input }),
)
