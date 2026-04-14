import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetAcquisitionAreaStatusesInput = { projectSlug: string } & Pick<
  Prisma.AcquisitionAreaStatusFindManyArgs,
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
  }: GetAcquisitionAreaStatusesInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: acquisitionAreaStatuses,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.acquisitionAreaStatus.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.acquisitionAreaStatus.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const acquisitionAreaStatusesWithCount = await Promise.all(
      acquisitionAreaStatuses.map(async (acquisitionAreaStatus) => {
        const acquisitionAreaCount = await db.acquisitionArea.count({
          where: {
            subsubsection: {
              subsection: {
                project: {
                  slug: projectSlug,
                },
              },
            },
            acquisitionAreaStatusId: acquisitionAreaStatus.id,
          },
        })

        return {
          ...acquisitionAreaStatus,
          acquisitionAreaCount,
        }
      }),
    )

    return {
      acquisitionAreaStatuses: acquisitionAreaStatusesWithCount,
      nextPage,
      hasMore,
      count,
    }
  },
)
