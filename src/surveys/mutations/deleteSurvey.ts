import { resolver } from "@blitzjs/rpc"
import { DeleteSurveySchema } from "../schemas"
import db from "db"

export default resolver.pipe(
  resolver.zod(DeleteSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => await db.survey.deleteMany({ where: { id } }),
)
