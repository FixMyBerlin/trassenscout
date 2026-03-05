import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateProjectShowLogEntries = z.object({
  showLogEntries: z.coerce.boolean(),
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateProjectShowLogEntries),
  resolver.authorize("ADMIN"),
  async ({ showLogEntries, projectSlug }) => {
    return await db.project.update({
      where: { slug: projectSlug },
      data: { showLogEntries },
    })
  },
)
