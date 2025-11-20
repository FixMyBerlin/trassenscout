import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateProjectAiEnabled = z.object({
  aiEnabled: z.coerce.boolean(),
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateProjectAiEnabled),
  resolver.authorize("ADMIN"),
  async ({ aiEnabled, projectSlug }) => {
    return await db.project.update({
      where: { slug: projectSlug },
      data: { aiEnabled },
    })
  },
)
