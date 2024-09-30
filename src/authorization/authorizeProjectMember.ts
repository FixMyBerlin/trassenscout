import db, { UserRoleEnum } from "@/db"
import { SessionContext } from "@blitzjs/auth"
import { AuthorizationError } from "blitz"
import { MembershipRole } from "./types"

type GetterFn = (input: Record<string, any>) => string

export function authorizeProjectMember(getProjectSlug: GetterFn, requiredRoles: MembershipRole[]) {
  return async function authorize<T extends Record<string, any>>(
    input: T,
    ctx: { session: SessionContext },
  ): Promise<T> {
    if (!ctx.session.userId) {
      throw new AuthorizationError()
    }
    // Call this early, so the check inside is triggered even if we are 'admin'
    const projectSlug = getProjectSlug(input)

    // Check if user is a super admin:
    if (ctx.session.role === UserRoleEnum.ADMIN) {
      return input
    }

    // Check if user is member of the project:
    // We want to make extra sure that we look at the latest role data.
    // Which is why we don't use the session to lookup the role.
    // Side note: We do delete the session whenever we change a users role, so this might be overkill?
    const freshMembership = await db.membership.findFirst({
      where: { project: { slug: projectSlug }, user: { id: ctx.session.userId } },
    })
    if (!freshMembership) throw new AuthorizationError()

    // Check if user has the require role:
    if (requiredRoles.includes(freshMembership.role)) {
      return input
    }
    throw new AuthorizationError()
  }
}
