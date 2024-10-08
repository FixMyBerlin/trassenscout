import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"

export const GetProject = ProjectSlugRequiredSchema

export default resolver.pipe(
  resolver.zod(GetProject),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const project = await db.project.findFirst({
      where: { slug: projectSlug },
    })
    if (!project) throw new NotFoundError()
    return project
  },
)
