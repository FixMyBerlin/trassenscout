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
import { CalendarEntrySchema } from "../schema"

const UpdateCalendarEntrySchema = ProjectSlugRequiredSchema.merge(
  CalendarEntrySchema.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateCalendarEntrySchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }, ctx: Ctx) => {
    const previous = await db.calendarEntry.findFirst({ where: { id } })

    const record = await db.calendarEntry.update({
      where: { id },
      data,
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Termin geändert`,
      userId: ctx.session.userId,
      projectSlug,
      previousRecord: previous,
      updatedRecord: record,
      calendarentryId: record.id,
    })

    return record
  },
)
