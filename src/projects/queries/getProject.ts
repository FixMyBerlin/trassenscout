import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import getProjectIdBySlug from "./getProjectIdBySlug"
import { authorizeProjectAdmin } from "src/authorization"

const GetProject = z.object({
  // This accepts type of undefined, but is required at runtime
  slug: z.string().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetProject),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ slug }) =>
    await db.project.findFirstOrThrow({
      where: { slug },
    })
)
