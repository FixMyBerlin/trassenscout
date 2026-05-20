import { ProjectRecordReviewState } from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetAcquisitionAreasWithProjectRecordCountBySubsubsectionSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsubsectionId: z.coerce.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(GetAcquisitionAreasWithProjectRecordCountBySubsubsectionSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, subsubsectionId }) => {
    const acquisitionAreas = await db.acquisitionArea.findMany({
      where: {
        subsubsectionId,
        subsubsection: {
          subsection: {
            project: {
              slug: projectSlug,
            },
          },
        },
      },
      select: {
        id: true,
        _count: {
          select: {
            projectRecords: {
              where: {
                reviewState: {
                  in: [ProjectRecordReviewState.APPROVED, ProjectRecordReviewState.NEEDSREVIEW],
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    })

    return acquisitionAreas.map((acquisitionArea) => ({
      id: acquisitionArea.id,
      projectRecordCount: acquisitionArea._count.projectRecords,
    }))
  },
)

