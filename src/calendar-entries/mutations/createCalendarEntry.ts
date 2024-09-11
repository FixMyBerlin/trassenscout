import { resolver } from "@blitzjs/rpc"
import db from "db"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"
import { CalendarEntrySchema } from "../schema"

const CreateCalendarEntrySchema = CalendarEntrySchema.merge(
  z.object({
    projectSlug: z.string(),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateCalendarEntrySchema),
  authorizeProjectAdmin(getProjectIdBySlug),
  async ({ projectSlug, ...input }) =>
    await db.calendarEntry.create({
      data: {
        projectId: await getProjectIdBySlug(projectSlug),
        ...input,
      },
    }),
)
