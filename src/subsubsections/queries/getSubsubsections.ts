import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { SubsubsectionWithPosition } from "./getSubsubsection"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"

type GetSubsubsectionsInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionFindManyArgs,
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
  }: GetSubsubsectionsInput) => {
    const saveWhere = { subsection: { project: { slug: projectSlug } }, ...where }
    const {
      items: subsubsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsection.count({ where: saveWhere }),
      query: (paginateArgs) =>
        db.subsubsection.findMany({
          ...paginateArgs,
          where: saveWhere,
          orderBy,
          include: {
            manager: { select: { firstName: true, lastName: true } },
            subsection: { select: { slug: true } },
          },
        }),
    })

    return {
      subsubsections: subsubsections as SubsubsectionWithPosition[], // Tip: Validate type shape with `satisfies`
      nextPage,
      hasMore,
      count,
    }
  },
)
