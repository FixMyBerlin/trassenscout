import { resolver } from "@blitzjs/rpc"
import { UpdateSurveySchema } from "../schemas"
import db from "db"

export default resolver.pipe(
  resolver.zod(UpdateSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => await db.survey.update({ where: { id }, data }),
)
