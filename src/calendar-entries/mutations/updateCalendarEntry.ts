import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { CalendarEntrySchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"

const UpdateCalendarEntry = CalendarEntrySchema.merge(
  z.object({
    id: z.number(),
  })
)

export default resolver.pipe(
  resolver.zod(UpdateCalendarEntry),
  authorizeProjectAdmin(),
  async ({ id, projectSlug, ...data }) => {
    const calendarEntry = await db.calendarEntry.update({
      where: { id },
      data,
    })

    return calendarEntry
  }
)
