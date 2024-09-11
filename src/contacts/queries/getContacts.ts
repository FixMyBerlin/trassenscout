import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetContactsInput = { projectSlug: string } & Pick<
  Prisma.ContactFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    where,
    orderBy = { id: "asc" },
    skip = 0,
    take = 100,
  }: GetContactsInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: contacts,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.contact.count({ where: safeWhere }),
      query: (paginateArgs) => db.contact.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
    })

    return {
      contacts,
      nextPage,
      hasMore,
      count,
    }
  },
)
