import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { SubsectionWithPosition } from "./getSubsection"

type GetSubsectionsInput = { projectSlug: string } & Pick<
  Prisma.SubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({
    projectSlug,
    where,
    orderBy = { order: "asc" },
    skip = 0,
    take = 100,
  }: GetSubsectionsInput) => {
    const saveWhere = { project: { slug: projectSlug }, ...where }
    const {
      items: subsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsection.count({ where: saveWhere }),
      query: (paginateArgs) =>
        db.subsection.findMany({
          ...paginateArgs,
          where: saveWhere,
          orderBy,
          include: { operator: { select: { id: true, slug: true } } },
        }),
    })

    return {
      subsections: subsections as SubsectionWithPosition[], // Tip: Validate type shape with `satisfies`
      nextPage,
      hasMore,
      count,
    }
  }
)
