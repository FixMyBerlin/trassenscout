import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { m2mFields, M2MFieldsType } from "../m2mFields"
import { UploadSchema } from "../schema"

const CreateUploadSchema = ProjectSlugRequiredSchema.merge(UploadSchema)

export default resolver.pipe(
  resolver.zod(CreateUploadSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }, ctx: Ctx) => {
    const projectId = await getProjectIdBySlug(projectSlug)

    // Extract m2m fields
    const connect: Record<M2MFieldsType | string, { connect: { id: number }[] | undefined }> = {}
    m2mFields.forEach((fieldName) => {
      connect[fieldName] = {
        connect: input[fieldName] ? input[fieldName].map((id) => ({ id })) : [],
      }
      delete input[fieldName]
    })

    const record = await db.upload.create({
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: {
        projectId,
        ...input,
        ...connect,
      },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Neues Dokument hochgeladen`,
      userId: ctx.session.userId,
      projectSlug,
      uploadId: record.id,
    })

    return record
  },
)
