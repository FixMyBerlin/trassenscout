import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { ProtocolTopicSchema } from "@/src/server/protocol-topics/schema"
import { resolver } from "@blitzjs/rpc"

const CreateProtocolTopicSchema = ProjectSlugRequiredSchema.merge(
  ProtocolTopicSchema.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateProtocolTopicSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    const projectId = await getProjectIdBySlug(projectSlug)

    // Prisma `upsert`: https://www.prisma.io/docs/concepts/components/prisma-client/crud
    return await db.protocolTopic.upsert({
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
