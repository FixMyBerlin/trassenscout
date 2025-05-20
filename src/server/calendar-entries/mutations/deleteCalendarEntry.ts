import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"

const DeleteCalendarEntrySchema = ProjectSlugRequiredSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(DeleteCalendarEntrySchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }, ctx: Ctx) => {
    const record = await db.calendarEntry.deleteMany({ where: { id } })

    await createLogEntry({
      action: "DELETE",
      message: `Termin gelöscht`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return record
  },
)
