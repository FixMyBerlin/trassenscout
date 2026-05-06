import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import { extractProjectSlug } from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { DeleteProjectRecordSchema } from "@/src/server/projectRecords/schemas"
import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export default resolver.pipe(
  resolver.zod(DeleteProjectRecordSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }, ctx: Ctx) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const projectRecord = await db.projectRecord.deleteMany({ where: { id } })

    if (projectRecord.count > 0) {
      await createLogEntry({
        action: "DELETE",
        message: `Protokoll-Eintrag ${id} gelöscht`,
        userId: ctx.session.userId,
        projectSlug,
      })
    }

    return projectRecord
  },
)
