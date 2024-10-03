import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { CreateSurveySchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateSurveySchema),
  resolver.authorize("ADMIN"),
  async (data) => {
    return await db.survey.create({ data })
  },
)
