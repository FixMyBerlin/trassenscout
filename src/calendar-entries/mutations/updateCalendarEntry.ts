import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getCalendarEntryProjectId from "../queries/getCalendarEntryProjectId"
import { CalendarEntrySchema } from "../schema"

const UpdateCalendarEntrySchema = CalendarEntrySchema.merge(
  z.object({
    id: z.number(),
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateCalendarEntrySchema),
  authorizeProjectAdmin(getCalendarEntryProjectId),
  async ({ id, ...data }) =>
    await db.calendarEntry.update({
      where: { id },
      data,
    }),
)
