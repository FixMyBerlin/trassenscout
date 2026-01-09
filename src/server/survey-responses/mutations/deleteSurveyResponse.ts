import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { DeleteSurveyResponseSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(DeleteSurveyResponseSchema),
  async ({ id }) => await db.surveyResponse.deleteMany({ where: { id } }),
)
