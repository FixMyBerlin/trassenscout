import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { AdminProjectRecordTemplatesTable } from "@/src/components/admin/project-record-templates/AdminProjectRecordTemplatesTable"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { projectRecordTemplatesQueryOptions } from "@/src/server/projectRecordTemplates/projectRecordTemplatesQueryOptions"

export function PageAdminProjectRecordTemplates() {
  const { data: templates } = useSuspenseQuery(projectRecordTemplatesQueryOptions())
  return (
    <>
      <AdminPageHeader
        title="Vorlagen Protokolleinträge"
        action={
          <CoreLink
            to="/admin/project-record-templates/new"
            button
            className={adminHeaderActionButtonClassName}
          >
            Neues Template
          </CoreLink>
        }
      />
      <AdminProjectRecordTemplatesTable templates={templates} />
    </>
  )
}
