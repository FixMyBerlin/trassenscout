import { paginate } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db, { Prisma, Section } from "db"

import { authorizeProjectAdmin } from "src/authorization"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { Prettify } from "src/core/types"

type GetSectionsInput = Pick<
  Prisma.SectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take" | "include"
>

const getProjectId = async (query: Record<string, any>): Promise<number> => {
  return (
    await db.section.findFirstOrThrow({
      where: query.where,
      select: { projectId: true },
    })
  ).projectId
}

export type SectionWithSubsectionsWithPosition = Section & {
  subsections: Pick<
    SubsectionWithPosition,
    "id" | "slug" | "geometry" | "labelPos" | "start" | "end"
  >[]
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
      query: (paginateArgs) =>
        db.section.findMany({
          ...paginateArgs,
          where,
          orderBy,
          include: {
            subsections: {
              select: {
                id: true,
                slug: true,
                geometry: true,
                labelPos: true,
                start: true,
                end: true,
              },
            },
          },
        }),
    })

    return {
      sections: sections as SectionWithSubsectionsWithPosition[], // Tip: Validate type shape with `satisfies`,
      nextPage,
      hasMore,
      count,
    }
  }
)
