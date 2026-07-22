import { UserRoleEnum } from "@/src/prisma/generated/browser"
import type { AppSession } from "@/src/server/auth/session.server"
import { getNumericUserId } from "@/src/server/auth/shared/getNumericUserId"
import db from "@/src/server/db.server"

export const inviteProjectSelect = {
  id: true,
  slug: true,
  subTitle: true,
} as const

export function getEditableProjectsForInvite(session: AppSession) {
  if (session.role === UserRoleEnum.ADMIN) {
    return db.project.findMany({
      orderBy: { slug: "asc" },
      select: inviteProjectSelect,
    })
  }

  return db.project.findMany({
    orderBy: { slug: "asc" },
    select: inviteProjectSelect,
    where: {
      memberships: {
        some: {
          role: "EDITOR",
          userId: getNumericUserId(session.userId),
        },
      },
    },
  })
}
