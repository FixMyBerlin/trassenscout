import { AuthorizationError, Ctx } from "blitz"
import db, { UserRoleEnum } from "db"

type Input =
  | (Record<string, any> & {
      projectId: number
    })
  | (Record<string, any> & {
      projectSlug: string
    })

export async function authorizeProjectAdmin<T extends Input>(input: T, ctx: Ctx): Promise<T> {
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
  const projectCondition =
    "projectId" in input ? { projectId: input.projectId } : { project: { slug: input.projectSlug } }

  if (
    await db.membership.findFirst({
      where: {
        userId: ctx.session.userId,
        ...projectCondition,
      },
    })
  ) {
    return input
  }

  throw new AuthorizationError()
}
