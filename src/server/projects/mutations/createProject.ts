import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { ProjectSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(ProjectSchema),
  resolver.authorize("ADMIN"),
  async ({ partnerLogoSrcs, ...data }) => {
    return await db.project.create({
      data: { ...data, partnerLogoSrcs: partnerLogoSrcs || undefined },
    })
  },
)
