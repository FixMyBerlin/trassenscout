import db, { SurveyResponseStateEnum } from "@/db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const CreateSurveyUploadPublicSchema = z.object({
  surveyResponseId: z.number().int().positive(),
  surveySessionId: z.number().int().positive(),
  title: z.string().min(2, { message: "Pflichtfeld. Mindestens 2 Zeichen." }),
  externalUrl: z.string().url(),
  mimeType: z.string().nullable().optional(),
  fileSize: z.number().int().positive().nullable().optional(),
})

/**
 * Public mutation to create Upload records for surveys.
 * Security: Verifies that surveyResponseId belongs to surveySessionId before creating the Upload record.
 */
export default resolver.pipe(resolver.zod(CreateSurveyUploadPublicSchema), async (input) => {
  // Verify that surveyResponseId belongs to surveySessionId
  const surveyResponse = await db.surveyResponse.findFirst({
    where: {
      id: input.surveyResponseId,
      surveySessionId: input.surveySessionId,
      state: SurveyResponseStateEnum.CREATED,
    },
    select: {
      surveySession: {
        select: {
          survey: {
            select: {
              projectId: true,
            },
          },
        },
      },
    },
  })

  if (!surveyResponse) {
    throw new Error("Survey response not found or does not belong to the provided session")
  }

  const projectId = surveyResponse.surveySession.survey.projectId

  // Create the Upload record
  const record = await db.upload.create({
    data: {
      projectId,
      surveyResponseId: input.surveyResponseId,
      title: input.title,
      externalUrl: input.externalUrl,
      mimeType: input.mimeType ?? null,
      fileSize: input.fileSize ?? null,
      // Public uploads don't have createdById/updatedById
      createdById: null,
      updatedById: null,
      // Other fields are null for survey uploads
      subsectionId: null,
      subsubsectionId: null,
      projectRecordEmailId: null,
      summary: null,
      latitude: null,
      longitude: null,
      collaborationUrl: null,
      collaborationPath: null,
    },
  })

  return record
})
