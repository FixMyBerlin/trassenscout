import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetSubsectionStatusInput = { projectSlug: string } & Pick<
  Prisma.SubsectionStatusFindManyArgs,
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
  }: GetSubsectionStatusInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: subsectionStatuss,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsectionStatus.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsectionStatus.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const subsectionStatusWithCount = await Promise.all(
      subsectionStatuss.map(async (subsectionStatus) => {
        const subsectionCount = await db.subsection.count({
          where: {
            project: { slug: projectSlug },
            subsectionStatusId: subsectionStatus.id,
          },
        })
        return {
          ...subsectionStatus,
          subsectionCount,
        }
      }),
    )

    return {
      subsectionStatuss: subsectionStatusWithCount,
      hasMore,
      count,
    }
  },
)
