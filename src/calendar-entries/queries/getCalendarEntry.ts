import { NotFoundError } from "blitz"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { authorizeProjectAdmin } from "src/authorization"

const GetCalendarEntry = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
  projectSlug: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetCalendarEntry),
  authorizeProjectAdmin(),
  async ({ id }) => {
    const calendarEntry = await db.calendarEntry.findFirst({ where: { id } })

    if (!calendarEntry) throw new NotFoundError()

    return calendarEntry
  }
)
