import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateProjectEvaluationsEnabled = z.object({
  evaluationsEnabled: z.coerce.boolean(),
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateProjectEvaluationsEnabled),
  resolver.authorize("ADMIN"),
  async ({ evaluationsEnabled, projectSlug }) => {
    return await db.project.update({
      where: { slug: projectSlug },
      data: { evaluationsEnabled },
    })
  },
)
