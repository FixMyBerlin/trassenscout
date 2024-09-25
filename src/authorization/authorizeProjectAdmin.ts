import db, { UserRoleEnum } from "@/db"
import { SessionContext } from "@blitzjs/auth"
import { AuthorizationError, NotFoundError } from "blitz"
import { editorRoles } from "./constants"
import { MembershipRole } from "./types"

type GetterFn =
  | ((input: Record<string, any>) => number)
  | ((input: Record<string, any>) => Promise<number>)
  | ((input: Record<string, any>) => string)
  | ((input: Record<string, any>) => Promise<string>)

export function authorizeProjectAdmin(
  getProjectIdOrSlug: GetterFn,
  requiredRoles: MembershipRole[] = editorRoles,
) {
  return async function authorize<T extends Record<string, any>>(
    input: T,
    ctx: { session: SessionContext },
  ): Promise<T> {
    if (!ctx.session.userId) {
      throw new AuthorizationError()
    }

    // check if user is a super admin or...
    if (ctx.session.role === UserRoleEnum.ADMIN) {
      return input
    }

    // check if user has project memberships and one of the required roles
    const idOrSlug = await getProjectIdOrSlug(input)
    if (!idOrSlug) {
      throw new Error("Invalid idOrSlug")
    }

    const projectId =
      typeof idOrSlug === "string"
        ? (await db.project.findUnique({ where: { slug: idOrSlug }, select: { id: true } }))?.id
        : idOrSlug
    if (!projectId) throw new NotFoundError()

    // We want to make extra sure that we look at the latest role data.
    // Which is why we don't use the session to lookup the role.
    // Side note: We do delete the session whenever we change a users role, so this might be overkill?
    const freshMembership = await db.membership.findUnique({
      where: { projectId_userId: { userId: ctx.session.userId, projectId } },
    })
    if (!freshMembership) throw new AuthorizationError()
    if (requiredRoles.includes(freshMembership.role)) {
      return input
    }

    throw new AuthorizationError()
  }
}
