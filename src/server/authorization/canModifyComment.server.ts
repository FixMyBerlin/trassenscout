import { UserRoleEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import type { MembershipRole } from "./types"

/** Admins: any comment. Everyone: own comments. Editors additionally: comments of former project members. */
export async function canModifyComment({
  membershipRole,
  sessionUserId,
  commentUserId,
  projectId,
}: {
  membershipRole: MembershipRole | null
  sessionUserId: number
  commentUserId: number
  projectId: number
}) {
  if (membershipRole === null) return true
  if (commentUserId === sessionUserId) return true
  if (membershipRole !== "EDITOR") return false

  const author = await db.user.findUnique({
    where: { id: commentUserId },
    select: { role: true, memberships: { where: { projectId }, select: { id: true } } },
  })
  // Global admins may comment without a membership; they are not former members.
  if (!author || author.role === UserRoleEnum.ADMIN) return false
  return author.memberships.length === 0
}
