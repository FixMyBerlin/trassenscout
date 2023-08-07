import { AuthorizationError } from "blitz"
import db, { UserRoleEnum } from "db"
import { SessionContext } from "@blitzjs/auth"

type GetterFn =
  | ((input: Record<string, any>) => number)
  | ((input: Record<string, any>) => Promise<number>)

export function authorizeProjectAdmin(getProjectId: GetterFn) {
  return async function authorize<T extends Record<string, any>>(
    input: T,
    ctx: { session: SessionContext },
  ): Promise<T> {
    if (!ctx.session.userId) {
      throw new AuthorizationError()
    }

    // check if user is a super admin or...
    if (
      await db.user.findFirst({
        where: {
          id: ctx.session.userId,
          role: UserRoleEnum.ADMIN,
        },
      })
    ) {
      return input
    }

    const projectId = await getProjectId(input)

    if (
      await db.membership.findFirst({
        where: {
          userId: ctx.session.userId,
          projectId,
        },
      })
    ) {
      return input
    }

    throw new AuthorizationError()
  }
}
