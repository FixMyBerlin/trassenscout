import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetProjectRecord = ProjectSlugRequiredSchema.merge(
  z.object({
    // This accepts type of undefined, but is required at runtime
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(GetProjectRecord),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }) => {
    const projectRecord = await db.projectRecord.findFirst({
      where: {
        id,
        reviewState: { in: ["NEEDSREVIEW", "APPROVED"] }, // Only show reviewed or approved projectRecords to normal users
      },
      include: {
        subsection: true,
        subsubsection: {
          include: {
            subsection: {
              select: { slug: true },
            },
          },
        },
        project: {
          select: { slug: true, aiEnabled: true },
        },
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        uploads: {
          orderBy: { id: "desc" },
          select: {
            id: true,
            title: true,
          },
        },
        projectRecordTopics: {
          select: {
            id: true,
            title: true,
          },
        },
        projectRecordEmail: {
          select: {
            id: true,
            textBody: true,
            from: true,
            date: true,
            subject: true,
            uploads: { select: { id: true, title: true } },
          },
        },
      },
    })

    if (!projectRecord) throw new NotFoundError()

    // If the project has AI disabled, entries created by the system are excluded from the results.
    if (!projectRecord.project?.aiEnabled && projectRecord.projectRecordAuthorType === "SYSTEM") {
      throw new NotFoundError()
    }

    return projectRecord
  },
)
