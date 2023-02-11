import { AuthorizationError, Ctx } from "blitz"
import db, { UserRoleEnum } from "db"

export const authorizeProjectAdmin = async (input: { projectId: number }, ctx: Ctx) => {
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

  // ...if user is a project admin
  if (
    await db.membership.findFirst({
      where: {
        userId: ctx.session.userId,
        projectId: input.projectId,
      },
    })
  ) {
    return input
  }

  throw new AuthorizationError()
}
