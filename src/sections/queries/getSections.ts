import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"

type GetSectionsInput = Pick<Prisma.SectionFindManyArgs, "where" | "orderBy" | "skip" | "take">

const getProjectId = async (query: Record<string, any>): Promise<number> => {
  return (
    await db.section.findFirstOrThrow({
      where: query.where,
      select: { projectId: true },
    })
  ).projectId
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectId),
  async ({ where, orderBy = { index: "asc" }, skip = 0, take = 100 }: GetSectionsInput) => {
    const {
      items: sections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.section.count({ where }),
      query: (paginateArgs) => db.section.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      sections,
      nextPage,
      hasMore,
      count,
    }
  }
)
