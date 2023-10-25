import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSubsubsectionStatusInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionStatusFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({
    projectSlug,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetSubsubsectionStatusInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: subsubsectionStatuss,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsectionStatus.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsubsectionStatus.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const subsubsectionStatusWithCount = await Promise.all(
      subsubsectionStatuss.map(async (subsubsectionStatus) => {
        const subsubsectionCount = await db.subsubsection.count({
          where: {
            subsection: { project: { slug: projectSlug } },
            subsubsectionStatusId: subsubsectionStatus.id,
          },
        })
        return {
          ...subsubsectionStatus,
          subsubsectionCount,
        }
      }),
    )

    return {
      subsubsectionStatuss: subsubsectionStatusWithCount,
      hasMore,
      count,
    }
  },
)
