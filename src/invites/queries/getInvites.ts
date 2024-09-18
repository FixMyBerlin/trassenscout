import db, { Prisma } from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { editorRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetInvitesInput = { projectSlug: string } & Pick<
  Prisma.InviteFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, editorRoles),
  async ({
    projectSlug,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetInvitesInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: invites,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.invite.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.invite.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
          select: {
            status: true,
            email: true,
            role: true,
            updatedAt: true,
            inviter: { select: { firstName: true, lastName: true } },
          },
        }),
    })

    return {
      invites,
      nextPage,
      hasMore,
      count,
    }
  },
)
