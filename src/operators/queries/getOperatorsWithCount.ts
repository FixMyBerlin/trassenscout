import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetOperatorsInput = { projectSlug: string } & Pick<
  Prisma.OperatorFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, where, orderBy, skip = 0, take = 100 }: GetOperatorsInput) => {
    const saveWhere = { project: { slug: projectSlug }, ...where }
    const {
      items: operators,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.operator.count({ where: saveWhere }),
      query: (paginateArgs) => db.operator.findMany({ ...paginateArgs, where: saveWhere, orderBy }),
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
