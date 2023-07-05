import { resolver } from "@blitzjs/rpc"
import db from "db"
import { UpdateSurveySchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(UpdateSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => await db.survey.update({ where: { id }, data })
)
