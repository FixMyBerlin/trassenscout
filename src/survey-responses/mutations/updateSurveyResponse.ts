import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { editorRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { m2mFields, M2MFieldsType } from "@/src/survey-responses/m2mFields"
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
    // Important: only touch m2m fields if they were explicitly provided.
    // Otherwise a "status-only" update would clear all existing relations.
    // copied from updateSubsubsection.ts
    const disconnect: Partial<Record<M2MFieldsType, { set: [] }>> = {}
    const connect: Partial<Record<M2MFieldsType, { connect: { id: number }[] }>> = {}
    m2mFields.forEach((fieldName) => {
      if (typeof data[fieldName] === "undefined") return

      disconnect[fieldName] = { set: [] }
      connect[fieldName] = {
        connect: Array.isArray(data[fieldName]) ? data[fieldName].map((id) => ({ id })) : [],
      }
      delete data[fieldName]
    })

    if (Object.keys(disconnect).length > 0) {
      await db.surveyResponse.update({
        where: { id },
        data: disconnect,
      })
    }

    const record = await db.surveyResponse.update({
      where: { id },
      // copied from updateSubsubsection.ts
      // @ts-expect-error The whole `m2mFields` is way to hard to type but apparently working
      data: { ...data, ...connect },
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
