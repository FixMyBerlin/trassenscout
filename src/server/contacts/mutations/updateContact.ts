import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { ContactSchema } from "../schema"

const UpdateContactSchema = ProjectSlugRequiredSchema.merge(
  ContactSchema.merge(
    z.object({
      id: z.number(),
    }),
  ),
)

export default resolver.pipe(
  resolver.zod(UpdateContactSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }, ctx: Ctx) => {
    const previous = await db.contact.findFirst({ where: { id } })
    const record = await db.contact.update({
      where: { id },
      data,
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Externen Kontakt geändert`,
      userId: ctx.session.userId,
      projectSlug,
      previousRecord: previous,
      updatedRecord: record,
      contactId: record.id,
    })

    return record
  },
)
