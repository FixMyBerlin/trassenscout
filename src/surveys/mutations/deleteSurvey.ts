import { resolver } from "@blitzjs/rpc"
import db from "db"
import { DeleteSurveySchema } from "../schemas"
import { authorizeProjectAdmin } from "src/authorization"
import getSurveyProjectId from "../queries/getSurveyProjectId"

export default resolver.pipe(
  resolver.zod(DeleteSurveySchema),
  authorizeProjectAdmin(getSurveyProjectId),
  async ({ id }) => await db.survey.deleteMany({ where: { id } }),
)
