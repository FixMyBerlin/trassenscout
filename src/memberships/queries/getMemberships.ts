import db, { Prisma } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

type GetMembershipInput = Pick<
  Prisma.MembershipFindManyArgs,
  "where" | "orderBy" | "skip" | "take" | "include"
>

export default resolver.pipe(
  resolver.authorize("ADMIN"),
  async ({ where, orderBy = { id: "asc" }, skip = 0, take = 100, include }: GetMembershipInput) => {
    const {
      items: memberships,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.membership.count({ where }),
      query: (paginateArgs) => db.membership.findMany({ ...paginateArgs, where, orderBy, include }),
    })

    return {
      memberships,
      nextPage,
      hasMore,
      count,
    }
  },
)
