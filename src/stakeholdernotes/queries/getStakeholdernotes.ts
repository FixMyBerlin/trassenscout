import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getSubsectionProjectId from "src/subsections/queries/getSubsectionProjectId"

type GetStakeholdernotesInput = { subsectionId: number } & Pick<
  Prisma.StakeholdernoteFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getSubsectionProjectId),
  async ({
    subsectionId,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetStakeholdernotesInput) => {
    const saveWhere = { subsectionId, ...where }
    const {
      items: stakeholdernotes,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.stakeholdernote.count({ where: saveWhere }),
      query: (paginateArgs) =>
        db.stakeholdernote.findMany({ ...paginateArgs, where: saveWhere, orderBy }),
    })

    return {
      stakeholdernotes,
      nextPage,
      hasMore,
      count,
    }
  }
)
