import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { membershipUpdateSession } from "../_utils/membershipUpdateSession"
import { MembershipSchema } from "../schema"

export const CreateMembershipSchema = MembershipSchema

export default resolver.pipe(
  resolver.zod(CreateMembershipSchema),
  resolver.authorize("ADMIN"),
  async (input, ctx) => {
    const created = await db.membership.create({ data: input })

    membershipUpdateSession(created.userId, ctx.session)

    return created
  },
)
