import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import getProjectIdBySlug from "@/src/server/projects/queries/getProjectIdBySlug"
import { m2mFields, M2MFieldsType } from "@/src/server/protocols/m2mFields"
import { ProtocolSchema } from "@/src/server/protocols/schemas"

import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { ProtocolReviewState, ProtocolType } from "@prisma/client"
import db from "db"

const CreateProtocolSchema = ProjectSlugRequiredSchema.merge(ProtocolSchema).omit({
  projectId: true,
  protocolAuthorType: true,
  protocolUpdatedByType: true,
  reviewState: true,
})

export default resolver.pipe(
  resolver.zod(CreateProtocolSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }, ctx: Ctx) => {
    // copied from updateSubsubsection.ts
    // const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      connect[fieldName] = { connect: data[fieldName] ? data[fieldName].map((id) => ({ id })) : [] }
      delete data[fieldName]
    })
    const projectId = await getProjectIdBySlug(projectSlug)
    const currentUserId = ctx.session.userId

    const record = await db.protocol.create({
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: {
        projectId,
        ...data,
        ...connect,
        // Set both author and updatedBy to current user on creation
        // we only have USER type for now
        userId: currentUserId,
        protocolAuthorType: ProtocolType.USER,
        updatedById: currentUserId,
        protocolUpdatedByType: ProtocolType.USER,
        // New protocols are immediately marked as APPROVED when created by editors/admins
        reviewState: ProtocolReviewState.APPROVED,
        reviewedById: currentUserId,
        reviewedAt: new Date(),
      },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Neues Projektprotokoll ${record ? record.title : ""}`,
      userId: ctx.session.userId,
      projectId,
      protocolId: record.id,
    })

    return record
  },
)
