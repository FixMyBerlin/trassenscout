import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateProjectExportApi = z.object({
  isExportApi: z.coerce.boolean(),
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateProjectExportApi),
  resolver.authorize("ADMIN"),
  async ({ isExportApi, projectSlug }) => {
    return await db.project.update({
      where: { slug: projectSlug },
      data: { isExportApi },
    })
  },
)
