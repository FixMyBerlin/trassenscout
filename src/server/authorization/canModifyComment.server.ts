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

  const authorMembership = await db.membership.findFirst({
    where: { projectId, userId: commentUserId },
    select: { id: true },
  })
  return authorMembership === null
}
