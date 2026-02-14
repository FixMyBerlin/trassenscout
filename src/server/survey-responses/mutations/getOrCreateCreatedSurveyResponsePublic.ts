import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { SurveyResponseSourceEnum, SurveyResponseStateEnum } from "@prisma/client"
import { z } from "zod"

const GetOrCreateCreatedSurveyResponsePublicSchema = z.object({
  surveySessionId: z.number().int().positive(),
  surveyPart: z.number().int().positive(),
  data: z.string(),
  source: z.nativeEnum(SurveyResponseSourceEnum),
  status: z.string().optional(),
})

/**
 * Returns the existing CREATED SurveyResponse for the given session+part,
 * or creates one if none exists.
 *
 * This makes "start part" idempotent and prevents duplicate CREATED responses
 * when users switch back and forth between intro and form.
 */
export default resolver.pipe(
  resolver.zod(GetOrCreateCreatedSurveyResponsePublicSchema),
  async (input) =>
    db.surveyResponse.upsert({
      where: {
        surveySessionId_surveyPart_state: {
          surveySessionId: input.surveySessionId,
          surveyPart: input.surveyPart,
          state: SurveyResponseStateEnum.CREATED,
        },
      },
      create: {
        surveySessionId: input.surveySessionId,
        surveyPart: input.surveyPart,
        data: input.data,
        source: input.source,
        status: input.status,
        state: SurveyResponseStateEnum.CREATED,
      },
      update: {},
      select: { id: true },
    }),
)
