import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { GetProject } from "./getProject"
import { extractSlug } from "../../authorization/extractSlug"
import { viewerRoles } from "../../authorization/constants"

export type ProjectWithDescription = {
  description: string | null
}

export default resolver.pipe(
  resolver.zod(GetProject),
  authorizeProjectAdmin(extractSlug, viewerRoles),
  async ({ slug }) => {
    const query = {
      where: {
        slug: slug,
      },
      select: {
        description: true,
      },
    }

    const project = await db.project.findFirst(query)

    if (!project) throw new NotFoundError()
    return project as ProjectWithDescription
  },
)
