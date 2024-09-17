import db, { Prisma } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { Ctx, paginate } from "blitz"

interface GetProjectsInput
  extends Pick<Prisma.ProjectFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(/* ok */),
  async ({ where, orderBy = { id: "asc" }, skip = 0, take = 100 }: GetProjectsInput, ctx: Ctx) => {
    const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
    if (user!.role !== "ADMIN") {
      where = { ...where, Membership: { some: { userId: user!.id } } }
    }
    const {
      items: projects,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.project.count({ where }),
      query: (paginateArgs) => db.project.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      projects,
      nextPage,
      hasMore,
      count,
    }
  },
)
