import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { ProjectRecordEmailsTable } from "@/src/components/admin/project-record-emails/ProjectRecordEmailsTable"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { projectRecordEmailsQueryOptions } from "@/src/server/projectRecordEmails/queries/projectRecordEmailsQueryOptions"

export function PageAdminProjectRecordEmails() {
  const { data: projectRecordEmails } = useSuspenseQuery(projectRecordEmailsQueryOptions({}))
  return (
    <>
      <AdminPageHeader
        title="Protokoll-Emails"
        action={
          <CoreLink
            to="/admin/project-record-emails/new"
            button
            icon="plus"
            className={adminHeaderActionButtonClassName}
          >
            Neue E-Mail
          </CoreLink>
        }
      />
      <ProjectRecordEmailsTable projectRecordEmails={projectRecordEmails} />
    </>
  )
}
