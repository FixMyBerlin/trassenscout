import db from "@/src/server/db.server"
import { AuthenticationError } from "@/src/shared/auth/errors"
import type { AppSession } from "./session.server"
import { createInviteLogEntry } from "./shared/createInviteLogEntry"
import { notifyEditorsAboutNewMembership } from "./shared/notifyEditorsAboutNewMembership"

function getNumericUserId(userId: number | string) {
  const numericUserId = typeof userId === "number" ? userId : Number(userId)
  if (!Number.isInteger(numericUserId)) {
    throw new Error("Invalid authenticated user id.")
  }
  return numericUserId
}

export async function acceptInviteForSession(inviteToken: string | undefined, session: AppSession) {
  if (!inviteToken) return { accepted: false as const }

  const userId = getNumericUserId(session.userId)
  const email = session.user.email.toLocaleLowerCase()

  const result = await db.$transaction(async (tx) => {
    const invite = await tx.invite.findFirst({
      where: { token: inviteToken, email, status: "PENDING" },
    })
    if (!invite) return null

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

    const acceptedInvite = await tx.invite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED" },
    })

    const project = await tx.project.findUnique({
      where: { id: invite.projectId },
      select: { slug: true },
    })

    return { acceptedInvite, projectSlug: project?.slug ?? null }
  })

  if (!result) {
    throw new AuthenticationError("Die Einladung ist ungültig oder abgelaufen.")
  }

  const invitee = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, firstName: true, id: true, lastName: true },
  })
  await createInviteLogEntry({ invite: result.acceptedInvite, invitee })
  await notifyEditorsAboutNewMembership({ invite: result.acceptedInvite, invitee })

  return {
    accepted: true as const,
    projectId: result.acceptedInvite.projectId,
    projectSlug: result.projectSlug,
  }
}
