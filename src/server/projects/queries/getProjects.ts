import db, { Prisma } from "@/db"
import getProjects from "@/src/server/projects/queries/getProjects"
import { resolver } from "@blitzjs/rpc"
import { Ctx, NotFoundError, paginate } from "blitz"

interface GetProjectsInput
  extends Pick<Prisma.ProjectFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export type TGetProjects = Awaited<ReturnType<typeof getProjects>>

export default resolver.pipe(
  resolver.authorize(/* ok */),
  async ({ where, orderBy = { id: "asc" }, skip = 0, take = 100 }: GetProjectsInput, ctx: Ctx) => {
    const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
    if (!user) throw new NotFoundError()

    if (user!.role !== "ADMIN") {
      where = { ...where, memberships: { some: { userId: user.id } } }
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
