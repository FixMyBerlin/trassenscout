import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { longTitle } from "@/src/core/components/text"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { m2mFields, M2MFieldsType } from "@/src/server/protocols/m2mFields"
import { ProtocolSchema } from "@/src/server/protocols/schemas"
import { resolver } from "@blitzjs/rpc"
import { ProtocolType } from "@prisma/client"
import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateProtocolSchema = ProjectSlugRequiredSchema.merge(
  ProtocolSchema.omit({
    reviewState: true,
    reviewedAt: true,
    reviewedById: true,
    reviewNotes: true,
    protocolAuthorType: true,
    protocolUpdatedByType: true,
  }).merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateProtocolSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }, ctx: Ctx) => {
    const previous = await db.protocol.findFirst({ where: { id } })
    const currentUserId = ctx.session.userId

    // copied from updateSubsubsection.ts
    const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      disconnect[fieldName] = { set: [] }
      connect[fieldName] = { connect: data[fieldName] ? data[fieldName].map((id) => ({ id })) : [] }
      delete data[fieldName]
    })

    await db.protocol.update({
      where: { id },
      data: disconnect,
    })

    const record = await db.protocol.update({
      where: { id },
      // copied from updateSubsubsection.ts
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: {
        ...data,
        ...connect,
        updatedById: currentUserId,
        // we only have USER type for now
        protocolUpdatedByType: ProtocolType.USER,
      },
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Protokoll mit der ID ${longTitle(String(record.id))} bearbeitet`,
      userId: ctx.session.userId,
      projectId: record.projectId,
      previousRecord: previous,
      updatedRecord: record,
      protocolId: record.id,
    })

    return record
  },
)
