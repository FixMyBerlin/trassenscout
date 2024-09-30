import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetStakeholdernotesInput = { projectSlug: string; subsectionId: number } & Pick<
  Prisma.StakeholdernoteFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
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
