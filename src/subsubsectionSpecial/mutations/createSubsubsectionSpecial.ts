import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { SubsubsectionSpecial } from "../schema"

const CreateSubsubsectionSpecialSchema = ProjectSlugRequiredSchema.merge(
  SubsubsectionSpecial.omit({ projectId: true }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsubsectionSpecialSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.subsubsectionSpecial.create({
      data: {
        ...input,
        projectId: await getProjectIdBySlug(projectSlug),
      },
    })
  },
)
