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
import { UploadSchema } from "../schema"

const CreateUploadSchema = ProjectSlugRequiredSchema.merge(UploadSchema)

export default resolver.pipe(
  resolver.zod(CreateUploadSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }, ctx: Ctx) => {
    const projectId = await getProjectIdBySlug(projectSlug)
    const record = await db.upload.create({
      data: {
        projectId,
        ...input,
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
