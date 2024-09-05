import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { viewerRoles } from "../../authorization/constants"

type GetSubsubsectionSpecialInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionSpecialFindManyArgs,
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
        const subsubsectionCount = await db.subsubsection.count({
          where: {
            subsection: { project: { slug: projectSlug } },
            specialFeatures: {
              some: {
                id: subsubsectionSpecial.id,
              },
            },
          },
        })
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
