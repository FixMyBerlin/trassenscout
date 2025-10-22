import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { SubsubsectionInfrastructureType } from "../schema"

const CreateSubsubsectionInfrastructureTypeSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionInfrastructureType.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionInfrastructureTypeSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.subsubsectionInfrastructureType.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
