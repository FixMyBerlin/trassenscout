import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

type GetContactsInput = { projectSlug: string } & Pick<
  Prisma.ContactFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, where, orderBy, skip = 0, take = 100 }: GetContactsInput) => {
    const saveWhere = { project: { slug: projectSlug }, ...where }
    const {
      items: contacts,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.contact.count({ where: saveWhere }),
      query: (paginateArgs) => db.contact.findMany({ ...paginateArgs, where: saveWhere, orderBy }),
    })

    return {
      contacts,
      nextPage,
      hasMore,
      count,
    }
  },
)
