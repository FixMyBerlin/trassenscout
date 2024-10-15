import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { selectUserFieldsForSession } from "../../auth/shared/selectUserFieldsForSession"
import { MembershipSchema } from "../schema"

export const CreateMembershipSchema = MembershipSchema

export default resolver.pipe(
  resolver.zod(CreateMembershipSchema),
  resolver.authorize("ADMIN"),
  async (input, ctx) => {
    const created = await db.membership.create({ data: input })

    // After changing the roles, we need to update the session
    // In other cases we delete the session but for the admin UI that
    // is a poor choise because we will remove our own session when chaning
    // or own membership.
    // We worked around the same issue in the project/new flow by disallowing self manager.
    const user = await db.user.findFirstOrThrow({
      where: { id: created.userId },
      select: selectUserFieldsForSession,
    })
    await ctx.session.$setPublicData(user)

    return created
  },
)
