import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { NetworkHierarchySchema } from "@/src/server/networkHierarchy/schema"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"

const CreateNetworkHierarchySchema = ProjectSlugRequiredSchema.merge(
  NetworkHierarchySchema.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateNetworkHierarchySchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.networkHierarchy.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
