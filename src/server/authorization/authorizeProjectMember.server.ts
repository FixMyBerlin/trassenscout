import { UserRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import { AuthorizationError } from "@/src/shared/auth/errors"
import type { MembershipRole } from "./types"

type ProjectAuthSession = {
  role: UserRoleEnum
  userId: number | string
}

function getNumericUserId(userId: number | string) {
  const numericUserId = typeof userId === "number" ? userId : Number(userId)
  if (!Number.isInteger(numericUserId)) {
    throw new AuthorizationError()
  }
  return numericUserId
}

export async function authorizeProjectMemberByProjectSlug(
  session: ProjectAuthSession,
  projectSlug: string,
  requiredRoles: MembershipRole[],
) {
  if (session.role === UserRoleEnum.ADMIN) {
    return null
  }

  const freshMembership = await db.membership.findFirst({
    where: {
      project: { slug: projectSlug },
      user: { id: getNumericUserId(session.userId) },
    },
  })

  if (!freshMembership || !requiredRoles.includes(freshMembership.role)) {
    throw new AuthorizationError()
  }

  return freshMembership.role
}
