import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma } from "db"

import { authorizeProjectAdmin } from "src/authorization"

interface GetSectionsInput
  extends Pick<Prisma.SectionFindManyArgs, "where" | "orderBy" | "skip" | "take" | "include"> {}

const getProjectId = async (query: Record<string, any>): Promise<number> => {
  return (
    await db.project.findFirstOrThrow({
      // @ts-ignore possible error is intended here
      where: { slug: query.where.project.slug || null },
      select: { id: true },
    })
  ).id
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectId),
  async ({
    where,
    orderBy = { index: "asc" },
    skip = 0,
    take = 100,
    include,
  }: GetSectionsInput) => {
    const {
      items: sections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.section.count({ where }),
      query: (paginateArgs) => db.section.findMany({ ...paginateArgs, where, orderBy, include }),
    })

    return {
      sections,
      nextPage,
      hasMore,
      count,
    }
  }
)
