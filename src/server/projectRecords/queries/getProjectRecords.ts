import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import db from "db"

type GetProjectRecordsInput = { projectSlug: string }

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug }: GetProjectRecordsInput) => {
    const projectRecords = await db.projectRecord.findMany({
      where: {
        project: { slug: projectSlug },
        reviewState: { in: ["NEEDSREVIEW", "APPROVED"] }, // Only show reviewed or approved projectRecords to normal users
      },
      orderBy: { date: "desc" },
      include: {
        project: { select: { slug: true, aiEnabled: true } },
        projectRecordTopics: true,
        subsection: true,
        subsubsection: {
          include: {
            subsection: {
              select: { slug: true },
            },
          },
        },
        uploads: {
          orderBy: { id: "desc" },
          select: {
            id: true,
            title: true,
            externalUrl: true,
          },
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
      },
    })

    return projectRecords
  },
)
