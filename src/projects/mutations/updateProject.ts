import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { ProjectSchema } from "../schema"

const UpdateProject = ProjectSlugRequiredSchema.merge(ProjectSchema)

export default resolver.pipe(
  resolver.zod(UpdateProject),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }) => {
    return await db.project.update({ where: { slug: projectSlug }, data })
  },
)
