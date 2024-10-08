import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { InviteSchema } from "../schema"

const UpdateInviteSchema = InviteSchema.merge(
  z.object({
    token: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateInviteSchema),
  // resolver.authorize(/* ok */), // Public page to accept an invitation
  async ({ token, ...data }) => {
    const result = await db.invite.update({
      where: { token },
      data,
    })
    // Only return minimal data to the public site
    return { token: result.token }
  },
)
