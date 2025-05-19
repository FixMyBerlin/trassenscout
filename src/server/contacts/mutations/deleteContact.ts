import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { getFullname } from "@/src/pagesComponents/users/utils/getFullname"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"

const DeleteContactSchema = ProjectSlugRequiredSchema.merge(z.object({ id: z.number() }))

export default resolver.pipe(
  resolver.zod(DeleteContactSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug }, ctx: Ctx) => {
    const contact = await db.contact.findFirst({
      where: { id },
      select: { firstName: true, lastName: true },
    })
    const record = await db.contact.deleteMany({ where: { id } })

    await createLogEntry({
      action: "DELETE",
      message: `Externen Kontakt ${contact ? getFullname(contact) : ""} gelöscht`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return record
  },
)
