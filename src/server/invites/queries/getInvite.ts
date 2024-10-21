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
    const result = await db.invite.findFirst({ where: { token, status: "PENDING" } })
    if (!result) return null
    // Only return minimal data to the public site
    // We use the email to prefill the form
    return { token: result.token, email: result.email }
  },
)
