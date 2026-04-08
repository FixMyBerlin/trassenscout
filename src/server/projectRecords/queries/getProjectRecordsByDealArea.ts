import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import db from "db"

type GetProjectRecordsByDealAreaInput = {
  projectSlug: string
  dealAreaId: number
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, dealAreaId }: GetProjectRecordsByDealAreaInput) => {
    const projectRecords = await db.projectRecord.findMany({
      where: {
        project: { slug: projectSlug },
        dealAreaId,
        reviewState: { in: ["NEEDSREVIEW", "APPROVED"] },
      },
      orderBy: { date: "desc" },
      include: {
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
