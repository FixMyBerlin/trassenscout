import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetSubsubsectionInfraInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionInfraFindManyArgs,
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
  }: GetSubsubsectionInfraInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: subsubsectionInfras,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsectionInfra.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsubsectionInfra.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const subsubsectionInfraWithCount = await Promise.all(
      subsubsectionInfras.map(async (subsubsectionInfra) => {
        const subsubsectionCount = await db.subsubsection.count({
          where: {
            subsection: { project: { slug: projectSlug } },
            subsubsectionInfraId: subsubsectionInfra.id,
          },
        })
        return {
          ...subsubsectionInfra,
          subsubsectionCount,
        }
      }),
    )

    return {
      subsubsectionInfras: subsubsectionInfraWithCount,
      hasMore,
      count,
    }
  },
)
