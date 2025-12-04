import { UserRoleEnum } from "@/db"
import { getBlitzContext } from "@/src/blitz-server"

/**
 * Ensures the current user is authenticated and has admin rights.
 *
 * Usage: Call at the top of any Next.js server action or API route that requires admin access.
 * Throws an Error if the user is not authenticated or not an admin.
 */
export async function authorizeAdmin() {
  const ctx = await getBlitzContext()
  const userId = ctx?.session?.userId
  const userRole = ctx?.session?.role

  if (!userId) {
    throw new Error("Authentication required")
  }

  if (userRole !== UserRoleEnum.ADMIN) {
    throw new Error("Admin access required")
  }
}
