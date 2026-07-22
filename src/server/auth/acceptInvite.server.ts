import db from "@/src/server/db.server"
import { AuthenticationError } from "@/src/shared/auth/errors"
import type { AppSession } from "./session.server"
import { createInviteLogEntry } from "./shared/createInviteLogEntry"
import { getNumericUserId } from "./shared/getNumericUserId"
import { notifyEditorsAboutNewMembership } from "./shared/notifyEditorsAboutNewMembership"

export async function acceptInviteForSession(inviteToken: string | undefined, session: AppSession) {
  if (!inviteToken) return { accepted: false as const }

  const userId = getNumericUserId(session.userId)
  // Invite rows are always created with lowercased email addresses.
  const email = session.user.email.toLocaleLowerCase()

  const result = await db.$transaction(async (tx) => {
    const invites = await tx.invite.findMany({
      orderBy: { id: "asc" },
      where: { email, status: "PENDING", token: inviteToken },
      include: { project: { select: { id: true, slug: true, subTitle: true } } },
    })
    if (invites.length === 0) return null

    for (const invite of invites) {
      await tx.membership.upsert({
        where: {
          projectId_userId: {
            projectId: invite.projectId,
            userId,
          },
        },
        create: {
          projectId: invite.projectId,
          role: invite.role,
          userId,
        },
        update: {
          role: invite.role,
        },
      })
    }

    await tx.invite.updateMany({
      where: { id: { in: invites.map((invite) => invite.id) } },
      data: { status: "ACCEPTED" },
    })

    return { acceptedInvites: invites, projectSlugs: invites.map((invite) => invite.project.slug) }
  })

  if (!result) {
    throw new AuthenticationError("Die Einladung ist ungültig oder abgelaufen.")
  }

  const invitee = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, firstName: true, id: true, lastName: true },
  })
  for (const invite of result.acceptedInvites) {
    await createInviteLogEntry({ invite, invitee })
  }
  await notifyEditorsAboutNewMembership({ invites: result.acceptedInvites, invitee })

  return {
    accepted: true as const,
    projectSlugs: result.projectSlugs,
  }
}
