import db, { SurveyResponseStateEnum } from "@/db"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const DeleteSurveyUploadPublicSchema = z.object({
  id: z.number().int().positive(),
  surveyResponseId: z.number().int().positive(),
  surveySessionId: z.number().int().positive(),
  deleteToken: z.string().min(1),
})

/**
 * Public mutation to delete Upload records created via the survey flow.
 * Security: surveyResponse must belong to surveySessionId and be CREATED; upload must be a
 * public-only survey upload (no project links, no createdById).
 */
export default resolver.pipe(resolver.zod(DeleteSurveyUploadPublicSchema), async (input) => {
  const upload = await db.upload.findFirst({
    where: {
      id: input.id,
      surveyResponseId: input.surveyResponseId,
      publicDeleteToken: input.deleteToken,
      createdById: null,
      subsectionId: null,
      subsubsectionId: null,
      projectRecordEmailId: null,
      projectRecords: { none: {} },
      surveyResponse: {
        id: input.surveyResponseId,
        surveySessionId: input.surveySessionId,
        state: SurveyResponseStateEnum.CREATED,
      },
    },
    select: {
      id: true,
      externalUrl: true,
      collaborationUrl: true,
      collaborationPath: true,
    },
  })

  if (!upload) {
    throw new Error("Upload not found or cannot be deleted in this context")
  }

  await deleteUploadFileAndDbRecord(upload)

  return { id: input.id }
})
