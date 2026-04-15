import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import db from "db"

type GetProjectRecordsByAcquisitionAreaInput = {
  projectSlug: string
  acquisitionAreaId: number
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, acquisitionAreaId }: GetProjectRecordsByAcquisitionAreaInput) => {
    const projectRecords = await db.projectRecord.findMany({
      where: {
        project: { slug: projectSlug },
        acquisitionAreaId,
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
        assignedTo: {
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
