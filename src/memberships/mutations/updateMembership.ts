import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { MembershipSchema } from "../schema"
import db from "db"

const UpdateMembership = MembershipSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateMembership),
  resolver.authorize("ADMIN"),
  async ({ id, ...data }) => {
    return await db.membership.update({ where: { id }, data })
  },
)
