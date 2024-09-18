import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetInviteSchema = z.object({
  token: z.string().nullable(),
})

export default resolver.pipe(
  resolver.zod(GetInviteSchema),
  // resolver.authorize(/* ok */) // Public page to accept an invitation,
  async ({ token }) => {
    if (!token) return null
    return await db.invite.findFirst({ where: { token, status: "PENDING" } })
  },
)
