import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { z } from "zod"

type GetStakeholdernotesInput = { sectionSlug: string } & Pick<
  Prisma.StakeholdernoteFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  resolver.authorize(),
  async ({ sectionSlug, where, orderBy, skip = 0, take = 100 }: GetStakeholdernotesInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant

    const saveWhere = { section: { slug: sectionSlug }, ...where }
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
