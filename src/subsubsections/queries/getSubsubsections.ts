import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import db, { Prisma } from "db"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "src/projects/queries/getProjectIdBySlug"
import { SubsubsectionWithPosition } from "./getSubsubsection"

type GetSubsubsectionsInput = { projectSlug: string } & Pick<
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
            // TODO: Fix types, the ly to us and say we have this data, but we don't need it
            // manager: { select: { firstName: true, lastName: true } },
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
  }
)
