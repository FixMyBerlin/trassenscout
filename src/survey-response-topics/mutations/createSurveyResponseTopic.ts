import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { SurveyResponseTopicSchema } from "../schema"

const CreateSurveyResponseTopicSchema = SurveyResponseTopicSchema.merge(
  z.object({ projectSlug: z.string() }),
).omit({ projectId: true })

export default resolver.pipe(
  resolver.zod(CreateSurveyResponseTopicSchema),
  async ({ projectSlug, ...input }) => {
    const projectId = await getProjectIdBySlug(projectSlug)

    // Prisma `upsert`: https://www.prisma.io/docs/concepts/components/prisma-client/crud
    const result = await db.surveyResponseTopic.upsert({
      where: {
        title_projectId: {
          title: input.title,
          projectId,
        },
      },
      update: {},
      create: {
        ...input,
        projectId,
      },
    })

    return result
  },
)
