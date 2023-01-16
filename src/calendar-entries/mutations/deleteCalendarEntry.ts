import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteCalendarEntry = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteCalendarEntry),
  resolver.authorize(),
  async ({ id }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const calendarEntry = await db.calendarEntry.deleteMany({ where: { id } })

    return calendarEntry
  }
)
