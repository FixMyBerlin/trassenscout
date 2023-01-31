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
    const calendarEntry = await db.calendarEntry.update({
      where: { id },
      data,
    })

    return calendarEntry
  }
)
