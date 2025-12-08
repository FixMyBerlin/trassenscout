import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { longTitle } from "@/src/core/components/text"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { subsectionGeometryTypeValidationRefine } from "../../shared/utils/geometryTypeValidation"
import { TGetSubsection } from "../queries/getSubsection"
import { SubsectionBaseSchema } from "../schema"

const UpdateSubsectionSchema = subsectionGeometryTypeValidationRefine(
  ProjectSlugRequiredSchema.merge(SubsectionBaseSchema.merge(z.object({ id: z.number() }))),
)

export default resolver.pipe(
  resolver.zod(UpdateSubsectionSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }, ctx: Ctx) => {
    const previous = await db.subsection.findFirst({ where: { id } })

    const record = await db.subsection.update({
      where: { id },
      data,
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Planungsabschnitt ${longTitle(record.slug)} bearbeitet`,
      userId: ctx.session.userId,
      projectId: record.projectId,
      previousRecord: previous,
      updatedRecord: record,
      subsectionId: record.id,
    })

    return record as TGetSubsection // Tip: Validate type shape with `satisfies`
  },
)
