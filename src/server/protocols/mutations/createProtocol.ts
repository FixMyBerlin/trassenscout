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
import db from "db"

const CreateProtocolSchema = ProjectSlugRequiredSchema.merge(ProtocolSchema)

export default resolver.pipe(
  resolver.zod(CreateProtocolSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }, ctx: Ctx) => {
    console.log("Hello create protocol", { data })
    // copied from updateSubsubsection.ts
    // const disconnect: Record<M2MFieldsType | string, { set: [] }> = {}
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      connect[fieldName] = { connect: data[fieldName] ? data[fieldName].map((id) => ({ id })) : [] }
      delete data[fieldName]
    })
    const projectId = await getProjectIdBySlug(projectSlug)
    const record = await db.protocol.create({
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: { projectId, ...data, ...connect },
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
