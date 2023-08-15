import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { SurveyResponseTopicSchema } from "../schema"

const CreateSurveyResponseTopicSchema = SurveyResponseTopicSchema.merge(
  z.object({
    projectSlug: z.string(),
  }),
).omit({ projectId: true })

export default resolver.pipe(
  resolver.zod(CreateSurveyResponseTopicSchema),
  async ({ projectSlug, ...input }) =>
    await db.surveyResponseTopic.create({
      data: {
        ...input,
        projectId: (await getProjectIdBySlug(projectSlug))!,
      },
    }),
)
