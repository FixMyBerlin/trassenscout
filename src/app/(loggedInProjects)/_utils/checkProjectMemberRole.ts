import db, { UserRoleEnum } from "@/db"
import type { MembershipRole } from "@/src/authorization/types"
import { getBlitzContext } from "@/src/blitz-server"

/**
 * Checks if the current user has a specific project role (without throwing an error).
 * Uses the same logic as authorizeProjectMember but returns a boolean instead.
 *
 * @param projectSlug - The slug of the project to check membership for
 * @param allowedRoles - Array of allowed project roles (e.g. ["EDITOR", "VIEWER"])
 * @returns true if the user has the required role, false otherwise
 */
export async function checkProjectMemberRole(
  projectSlug: string,
  allowedRoles: MembershipRole[],
): Promise<boolean> {
  const ctx = await getBlitzContext()
  const userId = ctx?.session?.userId
  const userRole = ctx?.session?.role

  if (!userId) {
    return false
  }

  // Check if user is admin
  if (userRole === UserRoleEnum.ADMIN) {
    return true
  }

  // Always check fresh membership from DB (same logic as authorizeProjectMember)
  const membership = await db.membership.findFirst({
    where: { project: { slug: projectSlug }, user: { id: userId }, role: { in: allowedRoles } },
  })

  return !!membership
}

