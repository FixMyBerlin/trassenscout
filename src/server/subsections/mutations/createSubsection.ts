import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { shortTitle } from "@/src/core/components/text/titles"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { SubsectionSchema } from "../schema"

const CreateSubsectionSchema = ProjectSlugRequiredSchema.merge(SubsectionSchema)

export default resolver.pipe(
  resolver.zod(CreateSubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }, ctx: Ctx) => {
    const record = await db.subsection.create({ data })

    await createLogEntry({
      action: "CREATE",
      message: `Neuer Planungsabschnitt ${shortTitle(record.slug)}`,
      userId: ctx.session.userId,
      projectSlug,
      subsectionId: record.id,
    })

    return record
  },
)
