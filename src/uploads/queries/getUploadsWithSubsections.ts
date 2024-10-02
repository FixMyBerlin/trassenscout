import db, { Prisma } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"
import { viewerRoles } from "../../authorization/constants"
import { extractProjectSlug } from "../../authorization/extractProjectSlug"

type GetUploadsInput = { projectSlug: string } & Pick<
  Prisma.UploadFindManyArgs,
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
  }: GetUploadsInput) => {
    const safeWhere = { project: { slug: projectSlug }, ...where }

    const {
      items: uploads,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.upload.count({ where: safeWhere }),
      query: (paginateArgs) =>
        db.upload.findMany({
          ...paginateArgs,
          where: safeWhere,
          orderBy,
          include: {
            subsection: { select: { id: true, slug: true, start: true, end: true } },
          },
        }),
    })

    return {
      uploads,
      nextPage,
      hasMore,
      count,
    }
  },
)
