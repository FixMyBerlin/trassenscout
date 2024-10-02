import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetNetworkHierarchyInput = { projectSlug: string } & Pick<
  Prisma.NetworkHierarchyFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
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
