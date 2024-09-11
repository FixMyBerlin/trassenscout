import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetSubsubsectionTaskInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionTaskFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetSubsubsectionTaskInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: subsubsectionTasks,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsectionTask.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsubsectionTask.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const subsubsectionTaskWithCount = await Promise.all(
      subsubsectionTasks.map(async (subsubsectionTask) => {
        const subsubsectionCount = await db.subsubsection.count({
          where: {
            subsection: { project: { slug: projectSlug } },
            subsubsectionTaskId: subsubsectionTask.id,
          },
        })
        return {
          ...subsubsectionTask,
          subsubsectionCount,
        }
      }),
    )

    return {
      subsubsectionTasks: subsubsectionTaskWithCount,
      hasMore,
      count,
    }
  },
)
