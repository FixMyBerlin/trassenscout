import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetSubsubsectionInfrastructureTypeInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionInfrastructureTypeFindManyArgs,
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
  }: GetSubsubsectionInfrastructureTypeInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: subsubsectionInfrastructureTypes,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsectionInfrastructureType.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsubsectionInfrastructureType.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const subsubsectionInfrastructureTypeWithCount = await Promise.all(
      subsubsectionInfrastructureTypes.map(async (subsubsectionInfrastructureType) => {
        const subsubsectionCount = await db.subsubsection.count({
          where: {
            subsection: { project: { slug: projectSlug } },
            subsubsectionInfrastructureTypeId: subsubsectionInfrastructureType.id,
          },
        })
        return {
          ...subsubsectionInfrastructureType,
          subsubsectionCount,
        }
      }),
    )

    return {
      subsubsectionInfrastructureTypes: subsubsectionInfrastructureTypeWithCount,
      hasMore,
      count,
    }
  },
)
