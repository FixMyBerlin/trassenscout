import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetProjectRecordDeleteInfoSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(GetProjectRecordDeleteInfoSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }) => {
    const projectRecord = await db.projectRecord.findFirst({
      where: { id },
      include: {
        project: {
          select: { slug: true },
        },
        uploads: {
          include: {
            subsection: {
              select: { id: true, slug: true, start: true, end: true },
            },
            Subsubsection: {
              select: {
                id: true,
                slug: true,
                subsection: { select: { slug: true } },
              },
            },
            projectRecords: {
              select: { id: true, title: true },
            },
            projectRecordEmail: {
              select: {
                id: true,
                projectRecords: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    })

    if (!projectRecord) throw new NotFoundError()

    // Verify project slug matches
    if (projectRecord.project.slug !== projectSlug) {
      throw new NotFoundError()
    }

    const uploadsWithInfo = projectRecord.uploads.map((upload) => {
      // Build protectionReasons with IDs
      const protectionReasons: {
        subsection?: number
        subsubsection?: number
        otherProjectRecords?: number[]
        projectRecordEmail?: number
      } = {}

      // Build display data for links (when available)
      const displayData: {
        subsection?: { id: number; slug: string; start: string; end: string }
        subsubsection?: { id: number; slug: string; subsectionSlug: string }
        otherProjectRecords?: Array<{ id: number; title: string }>
      } = {}

      if (upload.subsectionId && upload.subsection) {
        protectionReasons.subsection = upload.subsectionId
        displayData.subsection = {
          id: upload.subsection.id,
          slug: upload.subsection.slug,
          start: upload.subsection.start,
          end: upload.subsection.end,
        }
      }
      if (upload.subsubsectionId && upload.Subsubsection) {
        protectionReasons.subsubsection = upload.subsubsectionId
        displayData.subsubsection = {
          id: upload.Subsubsection.id,
          slug: upload.Subsubsection.slug,
          subsectionSlug: upload.Subsubsection.subsection.slug,
        }
      }

      // Find other project records (excluding the current one)
      const otherProjectRecords = upload.projectRecords.filter((pr) => pr.id !== id)
      if (otherProjectRecords.length > 0) {
        protectionReasons.otherProjectRecords = otherProjectRecords.map((pr) => pr.id)
        displayData.otherProjectRecords = otherProjectRecords.map((pr) => ({
          id: pr.id,
          title: pr.title,
        }))
      }

      if (upload.projectRecordEmailId) {
        protectionReasons.projectRecordEmail = upload.projectRecordEmailId
      }

      // Determine defaultAction
      let defaultAction: "save" | "delete" = "delete"

      // Rule 1: Uploads linked to subsection/subsubsection/other projectrecords → default Save
      if (upload.subsectionId || upload.subsubsectionId || otherProjectRecords.length > 0) {
        defaultAction = "save"
      }
      // Rule 2: Email-linked uploads
      else if (upload.projectRecordEmailId) {
        // Check if email-only (no subsection/subsubsection, no other projectrecords)
        const isEmailOnly =
          !upload.subsectionId && !upload.subsubsectionId && otherProjectRecords.length === 0

        // Check if email is only linked to this projectrecord
        const emailProjectRecordIds =
          upload.projectRecordEmail?.projectRecords.map((pr) => pr.id) || []
        const isEmailOnlyLinkedToThisProjectRecord =
          emailProjectRecordIds.length === 1 && emailProjectRecordIds[0] === id

        // Special case: email-only + only linked to this projectrecord → default Delete
        if (isEmailOnly && isEmailOnlyLinkedToThisProjectRecord) {
          defaultAction = "delete"
        } else {
          defaultAction = "save"
        }
      }
      // Rule 3: Otherwise → default Delete (already set)

      return {
        id: upload.id,
        title: upload.title,
        defaultAction,
        protectionReasons,
        displayData,
      }
    })

    return {
      projectRecord: {
        id: projectRecord.id,
        title: projectRecord.title,
        reviewState: projectRecord.reviewState,
        project: {
          slug: projectRecord.project.slug,
        },
      },
      uploads: uploadsWithInfo,
    }
  },
)
