import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getCalendarEntryProjectId from "../queries/getCalendarEntryProjectId"

const DeleteCalendarEntrySchema = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteCalendarEntrySchema),
  authorizeProjectAdmin(getCalendarEntryProjectId),
  async ({ id }) => await db.calendarEntry.deleteMany({ where: { id } }),
)
