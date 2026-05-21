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
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
        },
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

    return projectRecords.map(({ _count, ...rest }) => ({
      ...rest,
      commentCount: _count.projectRecordComments,
      uploadCount: _count.uploads,
    }))
  },
)
