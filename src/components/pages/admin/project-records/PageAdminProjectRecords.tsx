import { useSuspenseQuery } from "@tanstack/react-query"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { AdminProjectRecordsTable } from "@/src/components/admin/project-records/AdminProjectRecordTable"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { allProjectRecordsAdminQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

export function PageAdminProjectRecords() {
  const { data: projectRecords } = useSuspenseQuery(allProjectRecordsAdminQueryOptions())
  return (
    <>
      <AdminPageHeader
        title="Protokolleinträge (Review)"
        action={
          <CoreLink
            to="/admin/project-record-emails"
            button
            className={adminHeaderActionButtonClassName}
          >
            Protokoll-Emails
          </CoreLink>
        }
      />
      <AdminProjectRecordsTable projectRecords={projectRecords} />
    </>
  )
}
