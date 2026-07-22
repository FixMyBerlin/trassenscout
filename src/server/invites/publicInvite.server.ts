import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"

export async function getPublicInviteByToken(token: string | null) {
  endpointAuth.public("invite token lookup for accept-invite flow")
  if (!token) return null

  const invites = await db.invite.findMany({
    orderBy: { id: "asc" },
    where: { token, status: "PENDING" },
    select: {
      email: true,
      project: { select: { slug: true, subTitle: true } },
      token: true,
    },
  })
  if (invites.length === 0) return null
  const firstInvite = invites[0]!

  return {
    email: firstInvite.email.toLowerCase(),
    projects: invites.map((invite) => invite.project),
    token: firstInvite.token,
  }
}
