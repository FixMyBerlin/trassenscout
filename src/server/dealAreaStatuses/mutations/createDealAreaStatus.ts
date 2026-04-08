import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { DealAreaStatus } from "@/src/server/dealAreaStatuses/schema"
import { resolver } from "@blitzjs/rpc"

const CreateDealAreaStatusSchema = ProjectSlugRequiredSchema.merge(
  DealAreaStatus.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateDealAreaStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.dealAreaStatus.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
