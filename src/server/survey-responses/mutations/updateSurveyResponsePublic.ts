import db from "@/db"
import { resolver } from "@blitzjs/rpc"
import { SurveyResponseStateEnum } from "@prisma/client"
import { z } from "zod"

const UpdateSurveyResponsePublicSchema = z.object({
  id: z.number(),
  surveySessionId: z.number(),
  data: z.string(),
  state: z.nativeEnum(SurveyResponseStateEnum),
})

export default resolver.pipe(resolver.zod(UpdateSurveyResponsePublicSchema), async ({id, surveySessionId, data, state}) => {
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

  // Update the response
  return await db.surveyResponse.update({
    where: { state: SurveyResponseStateEnum.CREATED, id, surveySessionId },
    data: {
      data,
      state,
    },
  })
})
