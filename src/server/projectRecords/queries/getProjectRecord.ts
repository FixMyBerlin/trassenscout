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
          select: { slug: true },
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
          select: {
            id: true,
            title: true,
            externalUrl: true,
          },
        },
        projectRecordTopics: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!projectRecord) throw new NotFoundError()

    return projectRecord
  },
)
