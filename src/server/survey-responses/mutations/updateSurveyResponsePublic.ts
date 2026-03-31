import db from "@/db"
import { createNextOhvReferenceId } from "@/src/server/survey-responses/utils/ohvReferenceId"
import { resolver } from "@blitzjs/rpc"
import { SurveyResponseStateEnum } from "@prisma/client"
import { z } from "zod"

const UpdateSurveyResponsePublicSchema = z.object({
  id: z.number(),
  surveySessionId: z.number(),
  data: z.string(),
  state: z.nativeEnum(SurveyResponseStateEnum),
})

export default resolver.pipe(
  resolver.zod(UpdateSurveyResponsePublicSchema),
  async ({ id, surveySessionId, data, state }) => {
    return await db.$transaction(async (tx) => {
      const existingResponse = await tx.surveyResponse.findFirst({
        where: {
          id,
          surveySessionId,
        },
      })

      if (!existingResponse) {
        throw new Error(
          `SurveyResponse with id ${id} does not belong to surveySessionId ${surveySessionId}`,
        )
      }

      let nextData = data

      if (state === SurveyResponseStateEnum.SUBMITTED) {
        const surveySession = await tx.surveySession.findFirstOrThrow({
          where: { id: surveySessionId },
          select: {
            surveyId: true,
            survey: { select: { slug: true } },
          },
        })

        const isOhvPart2 =
          surveySession.survey.slug === "ohv-haltestellenfoerderung" &&
          existingResponse.surveyPart === 2

        if (isOhvPart2) {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${surveySession.surveyId})`

          const parsedData = JSON.parse(data) as Record<string, unknown>

          if (typeof parsedData.referenceId !== "string" || parsedData.referenceId.length === 0) {
            const referenceId = await createNextOhvReferenceId(surveySession.surveyId, tx)
            nextData = JSON.stringify({
              ...parsedData,
              referenceId,
            })
          }
        }
      }

      return await tx.surveyResponse.update({
        where: { state: SurveyResponseStateEnum.CREATED, id, surveySessionId },
        data: {
          data: nextData,
          state,
        },
      })
    })
  },
)
