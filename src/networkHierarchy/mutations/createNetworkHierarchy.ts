import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { OperatorSchema } from "@/src/operators/schema"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"

const CreateOperatorSchema = ProjectSlugRequiredSchema.merge(
  OperatorSchema.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateOperatorSchema),
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
