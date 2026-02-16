import db, { SurveyResponseStateEnum } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetUploadsMetaPublicSchema = z.object({
  surveyResponseId: z.number().int().positive(),
  surveySessionId: z.number().int().positive(),
  ids: z.array(z.number().int().positive()),
})

/**
 * Public query to fetch only metadata for uploads (no file URLs / no downloads).
 * Security: Verifies that surveyResponseId belongs to surveySessionId, then only returns uploads
 * where surveyResponseId matches the input (and id in ids).
 */
export default resolver.pipe(resolver.zod(GetUploadsMetaPublicSchema), async (input) => {
  // Verify that surveyResponseId belongs to surveySessionId
  const surveyResponseCount = await db.surveyResponse.count({
    where: {
      id: input.surveyResponseId,
      surveySessionId: input.surveySessionId,
      state: SurveyResponseStateEnum.CREATED,
    },
  })

  if (surveyResponseCount === 0) {
    throw new Error("Survey response not found or does not belong to the provided session")
  }

  // Fetch uploads metadata only
  const uploads = await db.upload.findMany({
    where: {
      id: { in: input.ids },
      surveyResponseId: input.surveyResponseId,
    },
    select: {
      id: true,
      title: true,
      mimeType: true,
    },
  })

  return uploads
})
