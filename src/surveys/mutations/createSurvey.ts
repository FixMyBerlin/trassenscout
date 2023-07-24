import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CreateSurveySchema } from "../schemas"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { authorizeProjectAdmin } from "src/authorization"

export default resolver.pipe(
  resolver.zod(CreateSurveySchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.survey.create({
      data: { projectId: await getProjectIdBySlug(projectSlug), ...input },
    }),
)
