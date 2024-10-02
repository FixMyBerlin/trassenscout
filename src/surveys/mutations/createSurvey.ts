import db from "@/db"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { CreateSurveySchema } from "../schemas"

export default resolver.pipe(
  resolver.zod(CreateSurveySchema),
  resolver.authorize("ADMIN"),
  async ({ projectSlug, ...input }) => {
    return await db.survey.create({
      data: {
        projectId: await getProjectIdBySlug(projectSlug),
        ...input,
      },
    })
  },
)
