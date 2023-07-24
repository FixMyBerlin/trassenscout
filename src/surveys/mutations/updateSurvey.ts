import { resolver } from "@blitzjs/rpc"
import db from "db"
import { UpdateSurveySchema } from "../schemas"
import { authorizeProjectAdmin } from "src/authorization"
import getSurveyProjectId from "../queries/getSurveyProjectId"

export default resolver.pipe(
  resolver.zod(UpdateSurveySchema),
  authorizeProjectAdmin(getSurveyProjectId),
  async ({ id, ...data }) => await db.survey.update({ where: { id }, data }),
)
