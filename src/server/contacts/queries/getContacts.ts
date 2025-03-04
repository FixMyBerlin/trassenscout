import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import getContacts from "./getContacts"

export type TContacts = Awaited<ReturnType<typeof getContacts>>

type GetContactsInput = { projectSlug: string } & Pick<
  Prisma.ContactFindManyArgs,
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
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
