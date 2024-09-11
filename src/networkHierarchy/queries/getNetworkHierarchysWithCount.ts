import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetNetworkHierarchyInput = { projectSlug: string } & Pick<
  Prisma.NetworkHierarchyFindManyArgs,
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
  }: GetNetworkHierarchyInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: networkHierarchys,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.networkHierarchy.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.networkHierarchy.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const networkHierarchysWithCount = await Promise.all(
      networkHierarchys.map(async (networkHierarchy) => {
        const subsectionCount = await db.subsection.count({
          where: {
            project: { slug: projectSlug },
            networkHierarchyId: networkHierarchy.id,
          },
        })
        return {
          ...networkHierarchy,
          subsectionCount,
        }
      }),
    )

    return {
      networkHierarchys: networkHierarchysWithCount,
      nextPage,
      hasMore,
      count,
    }
  },
)
