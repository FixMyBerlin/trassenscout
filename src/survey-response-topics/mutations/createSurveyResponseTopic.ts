import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { SurveyResponseTopicSchema } from "../schema"

const CreateSurveyResponseTopicSchema = ProjectSlugRequiredSchema.merge(
  SurveyResponseTopicSchema.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateSurveyResponseTopicSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    const projectId = await getProjectIdBySlug(projectSlug)

    // Prisma `upsert`: https://www.prisma.io/docs/concepts/components/prisma-client/crud
    return await db.surveyResponseTopic.upsert({
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
  },
)
