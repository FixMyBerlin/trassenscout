import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { GetProject } from "./getProject"

export type ProjectWithDescription = {
  description: string | null
}

export default resolver.pipe(
  resolver.zod(GetProject),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }) => {
    const project = await db.project.findFirst({
      where: { slug: projectSlug },
      select: { description: true },
    })

    if (!project) throw new NotFoundError()
    return project as ProjectWithDescription
  },
)
