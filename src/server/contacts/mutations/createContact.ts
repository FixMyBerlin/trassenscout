import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { ContactSchema } from "../schema"

const CreateContactSchema = ProjectSlugRequiredSchema.merge(ContactSchema)

export default resolver.pipe(
  resolver.zod(CreateContactSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...input }, ctx: Ctx) => {
    const projectId = await getProjectIdBySlug(projectSlug)
    const record = await db.contact.create({
      data: {
        projectId,
        ...input,
      },
    })

    await createLogEntry({
      action: "CREATE",
      message: `Neuer externer Kontakt`,
      userId: ctx.session.userId,
      projectId,
      contactId: record.id,
    })

    return record
  },
)
