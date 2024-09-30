import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/projects/queries/getProjectIdBySlug"
import { resolver } from "@blitzjs/rpc"
import { CalendarEntrySchema } from "../schema"

const CreateCalendarEntrySchema = ProjectSlugRequiredSchema.merge(CalendarEntrySchema)

export default resolver.pipe(
  resolver.zod(CreateCalendarEntrySchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }) => {
    return await db.calendarEntry.create({
      data: {
        projectId: await getProjectIdBySlug(projectSlug),
        ...input,
      },
    })
  },
)
