import db from "@/db"
import { createNextOhvVorgangsId } from "@/src/server/survey-responses/utils/ohvVorgangsId"
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
    // First verify the response belongs to the provided surveySessionId
    const existingResponse = await db.surveyResponse.findFirst({
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
      const surveySession = await db.surveySession.findFirstOrThrow({
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
        const parsedData = JSON.parse(data) as Record<string, unknown>

        if (typeof parsedData.vorgangsId !== "string" || parsedData.vorgangsId.length === 0) {
          const vorgangsId = await createNextOhvVorgangsId(surveySession.surveyId)
          nextData = JSON.stringify({
            ...parsedData,
            vorgangsId,
          })
        }
      }
    }

    return await db.surveyResponse.update({
      where: { state: SurveyResponseStateEnum.CREATED, id, surveySessionId },
      data: {
        data: nextData,
        state,
      },
    })
  },
)
