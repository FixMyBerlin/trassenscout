import db, { ProjectRecordReviewState } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { uploadWithSubsectionsInclude } from "@/src/server/uploads/_utils/uploadInclude"
import { resolver } from "@blitzjs/rpc"

type GetUploadsByAcquisitionAreaInput = {
  projectSlug: string
  acquisitionAreaId: number
}

export default resolver.pipe(
  // @ts-ignore
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, acquisitionAreaId }: GetUploadsByAcquisitionAreaInput) => {
    const uploads = await db.upload.findMany({
      where: {
        project: { slug: projectSlug },
        acquisitionAreaId,
        OR: [
          { projectRecords: { none: {} } },
          {
            projectRecords: {
              some: {
                reviewState: {
                  in: [ProjectRecordReviewState.APPROVED, ProjectRecordReviewState.NEEDSREVIEW],
                },
              },
            },
          },
        ],
      },
      orderBy: { id: "desc" },
      include: uploadWithSubsectionsInclude,
    })

    return uploads
  },
)
