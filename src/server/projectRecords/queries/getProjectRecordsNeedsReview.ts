import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import db from "db"
import { projectRecordInclude } from "../projectRecordInclude"

type GetProjectRecordsNeedsReviewInput = { projectSlug: string }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug }: GetProjectRecordsNeedsReviewInput) => {
    const projectRecords = await db.projectRecord.findMany({
      where: {
        project: { slug: projectSlug },
        reviewState: ProjectRecordReviewState.NEEDSREVIEW,
      },
      orderBy: { date: "desc" },
      include: projectRecordInclude,
    })

    return projectRecords
  },
)
