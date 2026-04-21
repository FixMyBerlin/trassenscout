import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import db from "db"

type GetProjectRecordsNeedsReviewInput = { projectSlug: string }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug }: GetProjectRecordsNeedsReviewInput) => {
    const rows = await db.projectRecord.findMany({
      where: {
        project: { slug: projectSlug },
        reviewState: ProjectRecordReviewState.NEEDSREVIEW,
      },
      orderBy: { date: "desc" },
      include: {
        projectRecordTopics: true,
        _count: {
          select: { projectRecordComments: true, uploads: true },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return rows.map(({ _count, ...rest }) => ({
      ...rest,
      commentCount: _count.projectRecordComments,
      uploadCount: _count.uploads,
    }))
  },
)
