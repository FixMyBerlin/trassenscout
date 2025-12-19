import { AdminProjectRecordsTable } from "@/src/app/(admin)/admin/project-records/_components/AdminProjectRecordTable"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links/Link"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getAllProjectRecordsAdmin from "@/src/server/projectRecords/queries/getAllProjectRecordsAdmin"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Protokoll",
}

export default async function AdminProjectRecordsPage() {
  const projectRecords = await invoke(getAllProjectRecordsAdmin, {})

  return (
    <>
      <PageHeader title="Admin: Protokoll" className="mt-12" />
      <Link href="/admin/project-record-emails">Zu den unprozessierten Protokoll-Emails</Link>{" "}
      <AdminProjectRecordsTable projectRecords={projectRecords} />
    </>
  )
}
