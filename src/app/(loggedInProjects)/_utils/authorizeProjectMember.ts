import db, { UserRoleEnum } from "@/db"
import type { MembershipRole } from "@/src/authorization/types"
import { getBlitzContext } from "@/src/blitz-server"

/**
 * Ensures the current user is authenticated and has either admin rights or a specific project role.
 *
 * Usage: Call at the top of any Next.js server action or API route that requires project membership/role.
 * Throws an Error if the user is not authenticated or does not have the required role.
 *
 * @param projectSlug - The slug of the project to check membership for
 * @param allowedRoles - Array of allowed project roles (e.g. ["EDITOR", "VIEWER"])
 */

export async function authorizeProjectMember(projectSlug: string, allowedRoles: MembershipRole[]) {
  const ctx = await getBlitzContext()
  const userId = ctx?.session?.userId
  const userRole = ctx?.session?.role

  if (!userId) {
    throw new Error("Authentication required")
  }

  // Check if user is admin
  if (userRole === UserRoleEnum.ADMIN) {
    return
  }

  // Always check fresh membership from DB
  const membership = await db.membership.findFirst({
    where: { project: { slug: projectSlug }, user: { id: userId }, role: { in: allowedRoles } },
  })
  if (!membership) {
    throw new Error("Access forbidden: required project role")
  }
}
