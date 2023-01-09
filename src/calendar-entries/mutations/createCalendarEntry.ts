import { resolver } from "@blitzjs/rpc"
import db from "db"
import { CalendarEntrySchema } from "../schema"

export default resolver.pipe(
  (input: { startAt: string }) => {
    // value will be formatted YYYY-MM-DDThh:mm when using <input type="datetime-local">
    // see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local#value
    input.startAt += ":00Z"
    return input
  },
  resolver.zod(CalendarEntrySchema),
  resolver.authorize(),
  async (input) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    return await db.calendarEntry.create({ data: input })
  }
)
