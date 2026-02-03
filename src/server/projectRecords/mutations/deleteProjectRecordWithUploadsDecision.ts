import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"

const DeleteProjectRecordWithUploadsDecisionSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    id: z.number(),
    keepUploadIds: z.array(z.number()),
  }),
)

export default resolver.pipe(
  resolver.zod(DeleteProjectRecordWithUploadsDecisionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, keepUploadIds, projectSlug }) => {
    // Load ProjectRecord with linked uploads and email relations
    const projectRecord = await db.projectRecord.findFirst({
      where: { id },
      include: {
        uploads: {
          select: {
            id: true,
            externalUrl: true,
            collaborationUrl: true,
            collaborationPath: true,
          },
        },
        projectRecordEmail: {
          include: {
            projectRecords: {
              select: { id: true },
            },
          },
        },
      },
    })

    if (!projectRecord) throw new NotFoundError()

    // Determine candidate upload IDs (all uploads currently linked to this projectRecord)
    const candidateUploadIds = projectRecord.uploads.map((upload) => upload.id)

    // Sanitize keepUploadIds to only include valid candidate uploads
    const sanitizedKeepUploadIds = keepUploadIds.filter((uploadId) =>
      candidateUploadIds.includes(uploadId),
    )

    // Determine which uploads to delete
    const toDeleteUploadIds = candidateUploadIds.filter(
      (uploadId) => !sanitizedKeepUploadIds.includes(uploadId),
    )

    // Fail-fast: Delete files first (if any deletion fails, we don't proceed)
    const uploadsToDelete = projectRecord.uploads.filter((upload) =>
      toDeleteUploadIds.includes(upload.id),
    )

    for (const upload of uploadsToDelete) {
      await deleteUploadFileAndDbRecord(upload)
    }

    // Store email ID before deletion (for orphan check)
    const projectRecordEmailId = projectRecord.projectRecordEmailId

    // Delete the ProjectRecord
    await db.projectRecord.deleteMany({ where: { id } })

    // Check if ProjectRecordEmail is now orphaned (no other projectRecords related) and delete it
    if (projectRecordEmailId) {
      const email = await db.projectRecordEmail.findFirst({
        where: { id: projectRecordEmailId },
        include: {
          projectRecords: {
            select: { id: true },
          },
        },
      })

      // If email has no remaining project records, delete it
      if (email && email.projectRecords.length === 0) {
        await db.projectRecordEmail.deleteMany({ where: { id: projectRecordEmailId } })
      }
    }

    return { id, projectSlug, deletedUploadCount: uploadsToDelete.length }
  },
  async ({ id, projectSlug, deletedUploadCount }, ctx: Ctx) => {
    // Create log entry for ProjectRecord deletion
    await createLogEntry({
      action: "DELETE",
      message: `Protokoll-Eintrag ${id} ${deletedUploadCount > 0 ? ` und ${deletedUploadCount} verknüpfte Dokumente` : ""} gelöscht`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return { id, projectSlug }
  },
)
