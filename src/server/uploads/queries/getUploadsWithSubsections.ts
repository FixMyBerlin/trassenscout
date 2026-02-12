import db, { Prisma, ProjectRecordReviewState } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { uploadWithSubsectionsInclude } from "@/src/server/uploads/_utils/uploadInclude"
import { resolver } from "@blitzjs/rpc"
import { paginate } from "blitz"

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
    orderBy = { id: "desc" },
    skip = 0,
    take = 100,
  }: GetUploadsInput) => {
    const safeWhere = {
      project: { slug: projectSlug },
      OR: [
        { projectRecords: { none: {} } },
        {
          projectRecords: {
            some: {
              reviewState: {
                in: [ProjectRecordReviewState.APPROVED, ProjectRecordReviewState.NEEDSREVIEW],
              },
            },
          },
        },
      ],
      ...where,
    }

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
          include: uploadWithSubsectionsInclude,
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
