import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

import { authorizeProjectAdmin } from "src/authorization"
import getCalendarEntryProjectId from "./getCalendarEntryProjectId"

const GetCalendarEntrySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetCalendarEntrySchema),
  authorizeProjectAdmin(getCalendarEntryProjectId),
  async ({ id }) => await db.calendarEntry.findFirstOrThrow({ where: { id } }),
)
