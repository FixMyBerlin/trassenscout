import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"

export async function getPublicInviteByToken(token: string | null) {
  endpointAuth.public("invite token lookup for accept-invite flow")
  if (!token) return null

  const invite = await db.invite.findFirst({
    where: { token, status: "PENDING" },
    select: { token: true, email: true },
  })
  if (!invite) return null

  return { token: invite.token, email: invite.email.toLowerCase() }
}
