import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"

const DeleteCalendarEntry = z.object({
  id: z.number(),
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(DeleteCalendarEntry),
  authorizeProjectAdmin(),
  async ({ id }) => {
    const calendarEntry = await db.calendarEntry.deleteMany({ where: { id } })

    return calendarEntry
  }
)
