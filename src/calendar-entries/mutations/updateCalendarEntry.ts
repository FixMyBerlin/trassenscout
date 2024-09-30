import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { CalendarEntrySchema } from "../schema"

const UpdateCalendarEntrySchema = ProjectSlugRequiredSchema.merge(
  CalendarEntrySchema.merge(z.object({ id: z.number() })),
)

export default resolver.pipe(
  resolver.zod(UpdateCalendarEntrySchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, ...data }) => {
    return await db.calendarEntry.update({
      where: { id },
      data,
    })
  },
)
