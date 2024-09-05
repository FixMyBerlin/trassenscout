import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { viewerRoles } from "../../authorization/constants"

type GetStakeholdernotesInput = { subsectionId: number } & Pick<
  Prisma.StakeholdernoteFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({
    subsectionId,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetStakeholdernotesInput) => {
    const safeWhere = { subsectionId, ...where }

    const {
      items: stakeholdernotes,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.stakeholdernote.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.stakeholdernote.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    return {
      stakeholdernotes,
      nextPage,
      hasMore,
      count,
    }
  },
)
