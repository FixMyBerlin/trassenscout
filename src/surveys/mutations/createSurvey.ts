import { resolver } from "@blitzjs/rpc"
import { CreateSurveySchema } from "../schemas"
import db from "db"

export default resolver.pipe(
  resolver.zod(CreateSurveySchema),
  resolver.authorize("ADMIN"),
  async (input) => await db.survey.create({ data: { projectId: 1, ...input } }),
)
