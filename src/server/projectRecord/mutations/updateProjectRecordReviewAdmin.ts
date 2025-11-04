import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { ProjectRecordSchema } from "@/src/server/projectRecord/schemas"
import { resolver } from "@blitzjs/rpc"
import { ProjectRecordReviewState } from "@prisma/client"
import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const ProjectRecordReviewUpdateSchema = ProjectSlugRequiredSchema.merge(
  ProjectRecordSchema.pick({
    reviewState: true,
    reviewNotes: true,
  }).merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(ProjectRecordReviewUpdateSchema),
  resolver.authorize("ADMIN"), // Admin authorization instead of project member
  async ({ id, reviewState, reviewNotes }, ctx: Ctx) => {
    const previous = await db.projectRecord.findFirst({ where: { id } })
    const currentUserId = ctx.session.userId

    // Only update review fields
    const updateData: any = {
      reviewState,
      reviewNotes,
    }

    // Set reviewedAt and reviewedById when marking as APPROVED/REJECTED
    if (
      reviewState === ProjectRecordReviewState.APPROVED ||
      reviewState === ProjectRecordReviewState.REJECTED
    ) {
      updateData.reviewedAt = new Date()
      updateData.reviewedById = currentUserId
    }
    // Clear review metadata when returning to NEEDSREVIEW
    else if (reviewState === ProjectRecordReviewState.NEEDSREVIEW) {
      updateData.reviewedAt = null
      updateData.reviewedById = null
    }

    const record = await db.projectRecord.update({
      where: { id },
      data: updateData,
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Protokoll-Review-Status mit der ID ${record.id} durch ADMIN geändert zu ${reviewState}`,
      userId: ctx.session.userId,
      projectId: record.projectId,
      previousRecord: previous,
      updatedRecord: record,
      projectRecordId: record.id,
    })

    return record
  },
)
