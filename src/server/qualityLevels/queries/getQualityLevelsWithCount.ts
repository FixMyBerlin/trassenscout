import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetQualityLevelInput = { projectSlug: string } & Pick<
  Prisma.QualityLevelFindManyArgs,
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
  }: GetQualityLevelInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: qualityLevels,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.qualityLevel.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.qualityLevel.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const qualityLevelsWithCount = await Promise.all(
      qualityLevels.map(async (qualityLevel) => {
        const subsubsectionCount = await db.subsubsection.count({
          where: {
            subsection: { project: { slug: projectSlug } },
            qualityLevelId: qualityLevel.id,
          },
        })
        return {
          ...qualityLevel,
          subsubsectionCount,
        }
      }),
    )

    return {
      qualityLevels: qualityLevelsWithCount,
      nextPage,
      hasMore,
      count,
    }
  },
)
