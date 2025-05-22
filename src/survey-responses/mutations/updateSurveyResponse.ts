import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { SurveyResponseSchema } from "../schema"

const UpdateSurveyResponseSchema = ProjectSlugRequiredSchema.merge(
  SurveyResponseSchema.merge(z.object({ id: z.number() })).omit({
    // We do not want to update this data, it should stay as is
    data: true,
    surveySessionId: true,
    surveyPart: true,
  }),
)

export default resolver.pipe(
  resolver.zod(UpdateSurveyResponseSchema),
  authorizeProjectMember(extractProjectSlug, editorRoles),
  async ({ id, projectSlug, ...data }, ctx: Ctx) => {
    const previous = await db.surveyResponse.findFirst({ where: { id } })

    const record = await db.surveyResponse.update({
      where: { id },
      data,
    })

    await createLogEntry({
      action: "UPDATE",
      message: `Beteiligungs-Beitrag geändert`,
      userId: ctx.session.userId,
      projectSlug,
      previousRecord: previous,
      updatedRecord: record,
      surveyResponseId: record.id,
    })

    return record
  },
)
