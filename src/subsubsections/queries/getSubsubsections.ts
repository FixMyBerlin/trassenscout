import db, { Prisma } from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"
import { SubsubsectionWithPosition } from "./getSubsubsection"

type GetSubsubsectionsInput = { projectSlug: string } & Pick<
  Prisma.SubsubsectionFindManyArgs,
  // Do not allow `include` or `select` here, since we overwrite the types below.
  "where" | "orderBy" | "skip" | "take"
>

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectAdmin(extractProjectSlug, viewerRoles),
  async ({
    projectSlug,
    where,
    orderBy = { slug: "asc" },
    skip = 0,
    take = 100,
  }: GetSubsubsectionsInput) => {
    const safeWhere = { subsection: { project: { slug: projectSlug } }, ...where }

    const {
      items: subsubsections,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.subsubsection.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.subsubsection.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
          include: {
            manager: { select: { firstName: true, lastName: true } },
            subsection: { select: { slug: true } },
            qualityLevel: { select: { title: true, slug: true } },
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
