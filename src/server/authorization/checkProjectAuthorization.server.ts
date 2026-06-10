import { UserRoleEnum } from "@/src/prisma/generated/client"
import type { AppSession } from "@/src/server/auth/session.server"
import db from "@/src/server/db.server"

type MembershipRole = "VIEWER" | "EDITOR"

function getNumericUserId(userId: number | string) {
  const numericUserId = typeof userId === "number" ? userId : Number(userId)
  if (!Number.isInteger(numericUserId)) {
    return null
  }
  return numericUserId
}

export type ProjectAuthorizationResult =
  | { authorized: true; membershipRole: MembershipRole | null }
  | { authorized: false }

export async function checkProjectAuthorization(session: AppSession, projectSlug: string) {
  if (session.role === UserRoleEnum.ADMIN) {
    return { authorized: true, membershipRole: null }
  }

  const userId = getNumericUserId(session.userId)
  if (userId === null) {
    return { authorized: false }
  }

  const membership = await db.membership.findFirst({
    where: {
      project: { slug: projectSlug },
      user: { id: userId },
    },
    select: { role: true },
  })

  if (!membership) {
    return { authorized: false }
  }

  return { authorized: true, membershipRole: membership.role }
}
