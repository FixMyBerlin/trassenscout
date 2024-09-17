import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import { extractSlug } from "../../authorization/extractSlug"

export const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetProject),
  authorizeProjectAdmin(extractSlug, viewerRoles),
  async ({ slug }) => {
    const project = await db.project.findFirst({
      where: { slug },
    })
    if (!project) throw new NotFoundError()
    return project
  },
)
