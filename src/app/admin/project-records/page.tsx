import { AdminProjectRecordsTable } from "@/src/app/admin/project-records/_components/AdminProjectRecordTable"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getAllProjectRecordsAdmin from "@/src/server/projectRecords/queries/getAllProjectRecordsAdmin"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Alle Protokolle",
}

export default async function AdminProjectRecordsPage() {
  const projectRecords = await invoke(getAllProjectRecordsAdmin, {})

  return (
    <>
      <PageHeader title="Admin: Alle Protokolle" className="mt-12" />
      <AdminProjectRecordsTable projectRecords={projectRecords} />
    </>
  )
}
