import db, { SurveyResponseStateEnum } from "@/db"
import { withApiKey } from "@/src/app/api/(apiKey)/_utils/withApiKey"
import { calculateComparisonDate } from "@/src/app/api/_utils/calculateComparisonDate"
import { isDev } from "@/src/core/utils/isEnv"
import { guardedCreateSystemLogEntry } from "@/src/server/systemLogEntries/create/guardedCreateSystemLogEntry"
import { deleteUploadFileAndDbRecord } from "@/src/server/uploads/_utils/deleteUploadFileAndDbRecord"

export const dynamic = "force-dynamic" // required with withApiKey (uses request.url)

const SURVEYRESPONSES_CREATED_DAYS_TO_DELETION = 14

// Keep this conservative: deleting uploads involves S3/Luckycloud calls.
const MAX_SURVEYRESPONSES_PER_RUN = 200

type UploadForDeletion = {
  id: number
  externalUrl: string
  collaborationUrl: string | null
  collaborationPath: string | null
}

export const GET = withApiKey(async ({ apiKey, request }) => {
  const url = new URL(request.url)
  const daysOverrideRaw = url.searchParams.get("days")

  let daysToDeletion = SURVEYRESPONSES_CREATED_DAYS_TO_DELETION
  if (isDev && daysOverrideRaw != null && daysOverrideRaw !== "") {
    const parsed = Number(daysOverrideRaw)
    if (Number.isFinite(parsed) && parsed >= 0) {
      daysToDeletion = Math.floor(parsed)
    }
  }

  const compareDate = calculateComparisonDate(daysToDeletion)

  const candidates = await db.surveyResponse.findMany({
    where: {
      state: SurveyResponseStateEnum.CREATED,
      surveySession: { createdAt: { lt: compareDate } },
    },
    select: { id: true },
    orderBy: { id: "asc" },
    take: MAX_SURVEYRESPONSES_PER_RUN,
  })

  const candidateIds = candidates.map((c) => c.id)

  let deletedSurveyResponsesCount = 0
  let deletedUploadsCount = 0
  let uploadDeletionFailedCount = 0
  let skippedSurveyResponsesDueToUploadErrorsCount = 0

  // Track a small sample for debugging in SystemLogEntry without bloating rows.
  const uploadDeletionFailedSample: Array<{ uploadId: number; error: string }> = []

  for (const { id: surveyResponseId } of candidates) {
    // Delete only uploads that are NOT related to subsection, subsubsection, projectrecord, or projectRecordEmail.
    // (ProjectRecord is represented via m2m relation `projectRecords`.)
    const uploadsToDelete: UploadForDeletion[] = await db.upload.findMany({
      where: {
        surveyResponseId,
        subsectionId: null,
        subsubsectionId: null,
        projectRecordEmailId: null,
        projectRecords: { none: {} },
      },
      select: {
        id: true,
        externalUrl: true,
        collaborationUrl: true,
        collaborationPath: true,
      },
      orderBy: { id: "asc" },
    })

    let hadUploadErrors = false
    for (const upload of uploadsToDelete) {
      try {
        await deleteUploadFileAndDbRecord(upload)
        deletedUploadsCount += 1
      } catch (error: any) {
        hadUploadErrors = true
        uploadDeletionFailedCount += 1
        if (uploadDeletionFailedSample.length < 10) {
          uploadDeletionFailedSample.push({
            uploadId: upload.id,
            error: error?.message ? String(error.message) : String(error),
          })
        }
      }
    }

    if (hadUploadErrors) {
      skippedSurveyResponsesDueToUploadErrorsCount += 1
      continue
    }

    // Safety net: Public survey uploads are created as "surveyResponse-only" and can't be linked elsewhere
    // by the public flow. However, an admin/backend workflow could later attach the same Upload to a
    // subsection/subsubsection/projectRecord(/email). In that (unlikely) case we keep the Upload and
    // detach it here to avoid FK constraint issues when deleting the SurveyResponse.
    await db.upload.updateMany({
      where: {
        surveyResponseId,
        OR: [
          { subsectionId: { not: null } },
          { subsubsectionId: { not: null } },
          { projectRecordEmailId: { not: null } },
          { projectRecords: { some: {} } },
        ],
      },
      data: { surveyResponseId: null },
    })

    const { count } = await db.surveyResponse.deleteMany({
      where: {
        id: surveyResponseId,
        state: SurveyResponseStateEnum.CREATED,
        surveySession: { createdAt: { lt: compareDate } },
      },
    })

    deletedSurveyResponsesCount += count
  }

  await guardedCreateSystemLogEntry({
    apiKey,
    logLevel: "INFO",
    message: "CRON surveyResponses-cleanup",
    context: {
      SURVEYRESPONSES_CREATED_DAYS_TO_DELETION,
      daysToDeletion,
      compareDate: compareDate.toISOString(),
      MAX_SURVEYRESPONSES_PER_RUN,
      candidateIdsCount: candidateIds.length,
      deletedSurveyResponsesCount,
      deletedUploadsCount,
      uploadDeletionFailedCount,
      skippedSurveyResponsesDueToUploadErrorsCount,
      uploadDeletionFailedSample,
    },
  })

  return Response.json(
    {
      statusText: "Success",
      candidateIdsCount: candidateIds.length,
      deletedSurveyResponsesCount,
      deletedUploadsCount,
      uploadDeletionFailedCount,
      skippedSurveyResponsesDueToUploadErrorsCount,
    },
    { status: 200 },
  )
})
