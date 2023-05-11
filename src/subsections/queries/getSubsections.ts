import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { SubsectionWithPosition } from "./getSubsection"

type GetSubsectionsInput = Pick<
  Prisma.SubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>

const getProjectId = async (query: Record<string, any>): Promise<number> =>
  (
    await db.section.findFirstOrThrow({
      where: { id: query.where.sectionId || null },
      select: { projectId: true },
    })
  ).projectId

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectId),
  async ({ where, orderBy = { title: "asc" }, skip = 0, take = 100 }: GetSubsectionsInput) => {
    const {
      items: subsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsection.count({ where }),
      query: (paginateArgs) => db.subsection.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      subsections: subsections as SubsectionWithPosition[], // Tip: Validate type shape with `satisfies`
      nextPage,
      hasMore,
      count,
    }
  }
)
