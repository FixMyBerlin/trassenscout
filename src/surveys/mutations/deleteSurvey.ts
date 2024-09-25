import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { DeleteSurveySchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(DeleteSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ id }) => await db.survey.deleteMany({ where: { id } }),
)
