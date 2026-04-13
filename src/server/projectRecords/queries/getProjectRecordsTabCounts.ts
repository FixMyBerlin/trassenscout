import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { ProjectRecordReviewState, ProjectRecordType } from "@prisma/client"
import db from "db"

type GetProjectRecordsTabCountsInput = { projectSlug: string }

export default resolver.pipe(
  resolver.zod(ProjectSlugRequiredSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }: GetProjectRecordsTabCountsInput) => {
    const project = await db.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, aiEnabled: true },
    })

    if (!project) {
      return { approvedCount: 0, needsReviewCount: 0 }
    }

    const approvedWhereBase = {
      projectId: project.id,
      reviewState: ProjectRecordReviewState.APPROVED,
    }

    const approvedCount = await db.projectRecord.count({
      where: project.aiEnabled
        ? approvedWhereBase
        : {
            ...approvedWhereBase,
            projectRecordAuthorType: { not: ProjectRecordType.SYSTEM },
          },
    })

    const needsReviewCount = await db.projectRecord.count({
      where: {
        projectId: project.id,
        reviewState: ProjectRecordReviewState.NEEDSREVIEW,
      },
    })

    return { approvedCount, needsReviewCount }
  },
)
