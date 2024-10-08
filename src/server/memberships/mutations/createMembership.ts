import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { MembershipSchema } from "../schema"

export const CreateMembershipSchema = MembershipSchema

export default resolver.pipe(
  resolver.zod(CreateMembershipSchema),
  resolver.authorize("ADMIN"),
  async (input) => {
    const created = await db.membership.create({ data: input })

    // Delete the session of the updated user so she is forced to log in again to update her membership
    await db.session.deleteMany({ where: { userId: created.userId } })

    return created
  },
)
