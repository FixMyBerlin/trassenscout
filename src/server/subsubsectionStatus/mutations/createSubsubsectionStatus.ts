import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { SubsubsectionStatus } from "../schema"

const CreateSubsubsectionStatusSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionStatus.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionStatusSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.subsubsectionStatus.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
