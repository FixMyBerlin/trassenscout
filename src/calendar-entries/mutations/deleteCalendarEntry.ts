import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteCalendarEntrySchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteCalendarEntrySchema),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const calendarEntry = await db.calendarEntry.deleteMany({ where: { id } })

    return calendarEntry
  }
)
