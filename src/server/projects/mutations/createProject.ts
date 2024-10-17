import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { membershipUpdateSession } from "../../memberships/_utils/membershipUpdateSession"
import { ProjectSchema } from "../schema"

export default resolver.pipe(
  resolver.zod(ProjectSchema),
  resolver.authorize("ADMIN"),
  async ({ partnerLogoSrcs, ...data }, ctx) => {
    const created = await db.project.create({
      data: { ...data, partnerLogoSrcs: partnerLogoSrcs || undefined },
    })

    if (created.managerId) {
      await db.membership.upsert({
        where: {
          projectId_userId: {
            projectId: created.id,
            userId: created.managerId,
          },
        },
        create: {
          projectId: created.id,
          userId: created.managerId,
          role: "EDITOR",
        },
        update: {
          role: "EDITOR",
        },
      })
      membershipUpdateSession(created.managerId, ctx.session)
    }

    return created
  },
)
