import { resolver } from "@blitzjs/rpc"
import db from "db"
import { DeleteSurveyResponseSchema } from "../../survey-responses/schema"

export default resolver.pipe(
  resolver.zod(DeleteSurveyResponseSchema),
  async ({ id }) => await db.surveyResponse.deleteMany({ where: { id } }),
)
