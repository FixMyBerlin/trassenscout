import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateCalendarEntry = z.object({
  title: z.string(),
  startAt: z.string(), // TODO .datetime()
  locationName: z.string().nullish(),
  locationUrl: z.string().nullish(),
  description: z.string().nullish(),
})

export default resolver.pipe(
  resolver.zod(CreateCalendarEntry),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const startAt = new Date(input.startAt)

    const calendarEntry = await db.calendarEntry.create({ data: { ...input, startAt } })

    return calendarEntry
  }
)
