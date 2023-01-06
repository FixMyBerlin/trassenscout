import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateCalendarEntry = z.object({
  title: z.string().min(8),
  startAt: z.string().datetime(),
  locationName: z.string().nullish(),
  locationUrl: z.string().nullish(),
  description: z.string().nullish(),
})

export default resolver.pipe(
  (input: { startAt: string }) => {
    // value will be formatted YYYY-MM-DDThh:mm when using <input type="datetime-local">
    // see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#value
    input.startAt += ":00Z"
    return input
  },
  resolver.zod(CreateCalendarEntry),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    return await db.calendarEntry.create({ data: input })
  }
)
