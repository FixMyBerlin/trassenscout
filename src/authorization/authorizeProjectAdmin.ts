import { UserRoleEnum } from "@/db"
import { SessionContext } from "@blitzjs/auth"
import { AuthorizationError } from "blitz"
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

    if (
      !!ctx.session.memberships!.find(
        ({ project, role }: any) =>
          (Number.isFinite(idOrSlug) ? project.id === idOrSlug : project.slug === idOrSlug) &&
          requiredRoles.includes(role),
      )
    ) {
      return input
    }

    throw new AuthorizationError()
  }
}
