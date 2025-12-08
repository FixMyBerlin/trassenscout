import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { shortTitle } from "@/src/core/components/text/titles"
import { geometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { SubsectionBaseSchema } from "../schema"

const BaseCreateSubsectionSchema = ProjectSlugRequiredSchema.merge(SubsectionBaseSchema)
const CreateSubsectionSchema = geometryTypeValidationRefine(BaseCreateSubsectionSchema)

type CreateSubsectionInput = z.infer<typeof BaseCreateSubsectionSchema>

export default resolver.pipe(
  resolver.zod(CreateSubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ projectSlug, ...data }: CreateSubsectionInput, ctx: Ctx) => {
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
