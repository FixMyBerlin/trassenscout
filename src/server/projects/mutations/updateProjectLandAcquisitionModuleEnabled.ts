import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UpdateProjectLandAcquisitionModuleEnabled = z.object({
  landAcquisitionModuleEnabled: z.coerce.boolean(),
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateProjectLandAcquisitionModuleEnabled),
  resolver.authorize("ADMIN"),
  async ({ landAcquisitionModuleEnabled, projectSlug }) => {
    return await db.project.update({
      where: { slug: projectSlug },
      data: { landAcquisitionModuleEnabled },
    })
  },
)
