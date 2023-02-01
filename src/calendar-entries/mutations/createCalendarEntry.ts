import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CalendarEntrySchema } from "../schema"

export default resolver.pipe(
  resolver.zod(CalendarEntrySchema),
  resolver.authorize(),
  async (input) => {
    const calendarEntry = await db.calendarEntry.create({ data: input })

    return calendarEntry
  }
)
