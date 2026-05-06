import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { withUploadPreviewUrl } from "@/src/server/uploads/_utils/withUploadPreviewUrl"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const UploadSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    // This accepts type of undefined, but is required at runtime
    id: z.number().optional().refine(Boolean, "Required"),
  }),
)

export default resolver.pipe(
  resolver.zod(UploadSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ id }) => {
    const upload = await db.upload.findFirstOrThrow({
      where: { id },
      include: {
        subsection: { select: { id: true, slug: true } },
        Subsubsection: {
          select: {
            id: true,
            slug: true,
            subsection: { select: { slug: true } },
          },
        },
        projectRecords: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
        projectRecordEmail: {
          select: {
            id: true,
            createdAt: true,
            subject: true,
          },
        },
        createdBy: {
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
        project: {
          select: {
            aiEnabled: true,
            slug: true,
            landAcquisitionModuleEnabled: true,
          },
        },
        surveyResponse: {
          include: {
            surveySession: {
              include: {
                survey: { select: { slug: true } },
              },
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
      },
    })

    return withUploadPreviewUrl(upload)
  },
)
