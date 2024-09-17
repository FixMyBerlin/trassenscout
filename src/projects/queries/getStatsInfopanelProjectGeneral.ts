import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractSlug } from "../../authorization/extractSlug"
import { GetProject } from "./getProject"

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
