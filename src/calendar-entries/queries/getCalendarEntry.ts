import db from "@/db"
import { authorizeProjectAdmin } from "@/src/authorization"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { viewerRoles } from "../../authorization/constants"
import getCalendarEntryProjectId from "./getCalendarEntryProjectId"

const GetCalendarEntrySchema = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetCalendarEntrySchema),
  // TODO: slug?
  authorizeProjectAdmin(getCalendarEntryProjectId, viewerRoles),
  async ({ id }) => await db.calendarEntry.findFirstOrThrow({ where: { id } }),
)
