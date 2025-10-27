import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { ProjectRecordTopicSchema } from "@/src/server/ProjectRecordTopics/schema"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"

import { resolver } from "@blitzjs/rpc"

const CreateProjectRecordTopicSchema = ProjectSlugRequiredSchema.merge(
  ProjectRecordTopicSchema.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateProjectRecordTopicSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    const projectId = await getProjectIdBySlug(projectSlug)

    // Prisma `upsert`: https://www.prisma.io/docs/concepts/components/prisma-client/crud
    return await db.projectRecordTopic.upsert({
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
