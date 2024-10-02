import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetSubsubsectionStatusInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionStatusFindManyArgs,
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
