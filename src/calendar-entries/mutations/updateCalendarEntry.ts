import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { CalendarEntrySchema } from "../schema"

const UpdateCalendarEntry = CalendarEntrySchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateCalendarEntry),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const calendarEntry = await db.calendarEntry.update({
      where: { id },
      data,
    })

    return calendarEntry
  }
)
