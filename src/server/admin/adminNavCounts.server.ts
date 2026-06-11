import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { emailTemplateDefinitions } from "@/src/shared/emailTemplates/registry"

export async function getAdminNavCounts(headers: Headers) {
  await endpointAuth.admin(headers)

  const [
    projects,
    users,
    unprocessedEmails,
    projectRecordsReview,
    logEntries,
    supportDocuments,
    surveys,
    projectRecordTemplates,
  ] = await Promise.all([
    db.project.count(),
    db.user.count(),
    db.projectRecordEmail.count({
      where: { projectRecords: { none: {} } },
    }),
    db.projectRecord.count({
      where: {
        reviewState: {
          in: [
            ProjectRecordReviewState.NEEDSADMINREVIEW,
            ProjectRecordReviewState.NEEDSREVIEW,
            ProjectRecordReviewState.REJECTED,
          ],
        },
      },
    }),
    db.systemLogEntry.count(),
    db.supportDocument.count(),
    db.survey.count(),
    db.projectRecordTemplate.count(),
  ])

  return {
    projects,
    users,
    unprocessedEmails,
    projectRecordsReview,
    logEntries,
    emailTemplates: emailTemplateDefinitions.length,
    supportDocuments,
    surveys,
    projectRecordTemplates,
  }
}
