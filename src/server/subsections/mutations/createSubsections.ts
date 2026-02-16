import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { geometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { SubsectionBaseSchema } from "../schema"

export const CreateSubsectionsSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsections: z.array(
      geometryTypeValidationRefine(
        SubsectionBaseSchema.omit({
          managerId: true,
          operatorId: true,
          description: true,
          subsectionStatusId: true,
        }),
      ),
    ),
  }),
)

export default resolver.pipe(
  resolver.zod(CreateSubsectionsSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ subsections, projectSlug }, ctx: Ctx) => {
    const records = await db.subsection.createMany({
      data: subsections,
    })

    await createLogEntry({
      action: "CREATE",
      message: `${subsections.length} Planungsabschnitte erstellt`,
      userId: ctx.session.userId,
      projectSlug,
    })

    return records
  },
)
