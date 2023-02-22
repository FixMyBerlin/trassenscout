import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"

type GetStakeholdernotesInput = { sectionSlug: string } & Pick<
  Prisma.StakeholdernoteFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

const getProjectId = async (input: Record<string, any>) =>
  (
    await db.section.findFirstOrThrow({
      where: { slug: input.sectionSlug },
      select: { projectId: true },
    })
  ).projectId

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectId),
  async ({ sectionSlug, where, orderBy, skip = 0, take = 100 }: GetStakeholdernotesInput) => {
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
