import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

interface GetContactsInput
  extends Pick<Prisma.ContactFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetContactsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: contacts,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.contact.count({ where }),
      query: (paginateArgs) => db.contact.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      contacts,
      nextPage,
      hasMore,
      count,
    }
  }
)
