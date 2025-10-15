import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { longTitle } from "@/src/core/components/text"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { ProtocolSchema } from "@/src/server/protocols/schemas"
import { resolver } from "@blitzjs/rpc"
import { ProtocolReviewState } from "@prisma/client"
import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const ProtocolReviewUpdateSchema = ProjectSlugRequiredSchema.merge(
  ProtocolSchema.pick({
    reviewState: true,
    reviewNotes: true,
  }).merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(ProtocolReviewUpdateSchema),
  resolver.authorize("ADMIN"), // Admin authorization instead of project member
  async ({ id, reviewState, reviewNotes }, ctx: Ctx) => {
    const previous = await db.protocol.findFirst({ where: { id } })
    const currentUserId = ctx.session.userId

    // Only update review fields
    const updateData: any = {
      reviewState,
      reviewNotes,
    }

    // Set reviewedAt and reviewedById when marking as APPROVED/REJECTED
    if (
      reviewState === ProtocolReviewState.APPROVED ||
      reviewState === ProtocolReviewState.REJECTED
    ) {
      updateData.reviewedAt = new Date()
      updateData.reviewedById = currentUserId
    }
    // Clear review metadata when returning to NEEDSREVIEW
    else if (reviewState === ProtocolReviewState.NEEDSREVIEW) {
      updateData.reviewedAt = null
      updateData.reviewedById = null
    }

    const record = await db.protocol.update({
      where: { id },
      data: updateData,
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Protokoll-Review-Status mit der ID ${longTitle(String(record.id))} geändert zu ${reviewState}`,
      userId: ctx.session.userId,
      projectId: record.projectId,
      previousRecord: previous,
      updatedRecord: record,
      protocolId: record.id,
    })

    return record
  },
)
