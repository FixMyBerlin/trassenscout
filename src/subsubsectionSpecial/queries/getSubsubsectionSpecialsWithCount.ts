import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSubsubsectionSpecialInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionSpecialFindManyArgs,
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
  }: GetSubsubsectionSpecialInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: subsubsectionSpecials,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsectionSpecial.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsubsectionSpecial.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const subsubsectionSpecialWithCount = await Promise.all(
      subsubsectionSpecials.map(async (subsubsectionSpecial) => {
        // const subsubsectionCount = await db.subsubsection.count({
        //   where: {
        //     subsection: { project: { slug: projectSlug } },
        //     subsubsectionSpecialId: subsubsectionSpecial.id,
        //   },
        // })
        const subsubsectionCount = 0
        return {
          ...subsubsectionSpecial,
          subsubsectionCount,
        }
      }),
    )

    return {
      subsubsectionSpecials: subsubsectionSpecialWithCount,
      hasMore,
      count,
    }
  },
)
