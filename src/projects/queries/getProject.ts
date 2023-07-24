import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import { z } from "zod"
import getProjectIdBySlug from "./getProjectIdBySlug"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetProject),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ slug }) => {
    const project = await db.project.findFirst({
      where: { slug },
    })
    if (!project) throw new NotFoundError()
    return project
  },
)
