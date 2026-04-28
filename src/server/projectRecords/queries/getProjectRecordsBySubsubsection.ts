import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import db from "db"

type GetProjectRecordsBySubsubsectionInput = {
  projectSlug: string
  subsubsectionId: number
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsubsectionId }: GetProjectRecordsBySubsubsectionInput) => {
    const projectRecords = await db.projectRecord.findMany({
      where: {
        project: { slug: projectSlug },
        reviewState: { in: ["NEEDSREVIEW", "APPROVED"] }, // Only show reviewed or approved projectRecords to normal users
        OR: [
          { subsubsectionId: subsubsectionId },
          { acquisitionArea: { subsubsectionId: subsubsectionId } },
        ],
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
        acquisitionArea: {
          select: {
            id: true,
            subsubsection: {
              select: {
                slug: true,
                subsection: { select: { slug: true } },
              },
            },
            parcel: {
              select: {
                alkisParcelId: true,
              },
            },
          },
        },
        _count: {
          select: { projectRecordComments: true, uploads: true },
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return projectRecords.map(({ _count, ...rest }) => ({
      ...rest,
      commentCount: _count.projectRecordComments,
      uploadCount: _count.uploads,
    }))
  },
)
