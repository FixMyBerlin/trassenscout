import { resolver } from "@blitzjs/rpc"
import db from "db"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { CreateSurveySchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ projectSlug, ...input }) =>
    await db.survey.create({
      data: { projectId: await getProjectIdBySlug(projectSlug), ...input },
    }),
)
