import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CreateSurveySchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateSurveySchema),
  resolver.authorize("ADMIN"),
  async (input) => await db.survey.create({ data: { projectId: 1, ...input } })
)
