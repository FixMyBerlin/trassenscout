import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { emailTemplateDefinitions } from "@/src/shared/emailTemplates/registry"

export async function getAdminNavCounts(headers: Headers) {
  await endpointAuth.admin(headers)

  const [
    projects,
    users,
    unprocessedEmails,
    logEntries,
    supportDocuments,
    surveys,
    projectRecordTemplates,
    formTemplates,
    mcpDrafts,
  ] = await Promise.all([
    db.project.count(),
    db.user.count(),
    db.projectRecordEmail.count({
      where: { projectRecords: { none: {} } },
    }),
    db.systemLogEntry.count(),
    db.supportDocument.count(),
    db.survey.count(),
    db.projectRecordTemplate.count(),
    db.formTemplate.count(),
    db.mcpDraft.count(),
  ])

  return {
    projects,
    users,
    unprocessedEmails,
    logEntries,
    emailTemplates: emailTemplateDefinitions.length,
    supportDocuments,
    surveys,
    projectRecordTemplates,
    formTemplates,
    mcpDrafts,
  }
}
