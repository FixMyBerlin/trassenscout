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
import { CalendarEntrySchema } from "../schema"

const CreateCalendarEntrySchema = ProjectSlugRequiredSchema.merge(CalendarEntrySchema)

export default resolver.pipe(
  resolver.zod(CreateCalendarEntrySchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }, ctx: Ctx) => {
    const projectId = await getProjectIdBySlug(projectSlug)
    const record = await db.calendarEntry.create({
      data: {
        projectId,
        ...input,
      },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Neuer Termin`,
      userId: ctx.session.userId,
      projectId,
      calendarentryId: record.id,
    })

    return record
  },
)
