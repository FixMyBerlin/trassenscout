import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetDealAreaStatusesInput = { projectSlug: string } & Pick<
  Prisma.DealAreaStatusFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    where,
    orderBy = { title: "asc" },
    skip = 0,
    take = 100,
  }: GetDealAreaStatusesInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: dealAreaStatuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.dealAreaStatus.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.dealAreaStatus.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const dealAreaStatusesWithCount = await Promise.all(
      dealAreaStatuses.map(async (dealAreaStatus) => {
        const dealAreaCount = await db.dealArea.count({
          where: {
            subsubsection: {
              subsection: {
                project: {
                  slug: projectSlug,
                },
              },
            },
            dealAreaStatusId: dealAreaStatus.id,
          },
        })

        return {
          ...dealAreaStatus,
          dealAreaCount,
        }
      }),
    )

    return {
      dealAreaStatuses: dealAreaStatusesWithCount,
      nextPage,
      hasMore,
      count,
    }
  },
)
