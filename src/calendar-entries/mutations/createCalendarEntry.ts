import { resolver } from "@blitzjs/rpc"
import db from "db"

import { CalendarEntrySchema } from "../schema"
import { authorizeProjectAdmin } from "src/authorization"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

export default resolver.pipe(
  resolver.zod(CalendarEntrySchema),
  authorizeProjectAdmin,
  async (input) => {
    return await db.calendarEntry.create({
      data: {
        projectId: (await getProjectIdBySlug(input.projectSlug))!,
        ...input,
      },
    })
  }
)
