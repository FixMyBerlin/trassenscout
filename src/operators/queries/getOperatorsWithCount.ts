import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetOperatorsInput = { projectSlug: string } & Pick<
  Prisma.OperatorFindManyArgs,
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
  }: GetOperatorsInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: operators,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.operator.count({ where: safeWhere }),
      query: (paginateArgs) => db.operator.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    const operatorsWithCount = await Promise.all(
      operators.map(async (operator) => {
        const subsectionCount = await db.subsection.count({
          where: { projectId: operator.projectId, operatorId: operator.id },
        })
        return {
          ...operator,
          subsectionCount,
        }
      }),
    )

    return {
      operators: operatorsWithCount,
      nextPage,
      hasMore,
      count,
    }
  },
)
