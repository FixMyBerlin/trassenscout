import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import db from "db"
import { projectRecordInclude } from "../projectRecordInclude"

type GetProjectRecordsInput = { projectSlug: string }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }: GetProjectRecordsInput) => {
    const projectRecords = await db.projectRecord.findMany({
      where: {
        project: { slug: projectSlug },
        reviewState: ProjectRecordReviewState.APPROVED, // Only show approved projectRecords on the main page
      },
      orderBy: { date: "desc" },
      include: projectRecordInclude,
    })

    const projectRecordsWithCommentAndUploadCount = projectRecords.map((record) => ({
      ...record,
      commentCount: record.projectRecordComments.length,
      uploadCount: record.uploads.length,
    }))

    // If the project has AI disabled, entries created by the system are excluded from the results.
    if (
      projectRecordsWithCommentAndUploadCount.length > 0 &&
      !projectRecordsWithCommentAndUploadCount[0]?.project?.aiEnabled
    ) {
      return projectRecordsWithCommentAndUploadCount.filter(
        (record) => record.projectRecordAuthorType !== "SYSTEM",
      )
    }
    return projectRecordsWithCommentAndUploadCount
  },
)
