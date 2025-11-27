import { AdminEditProjectRecordForm } from "@/src/app/admin/project-records/[projectRecordId]/edit/_components/AdminEditProjectRecordIdForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Protokoll bearbeiten",
}

export default async function AdminEditProjectRecordPage({
  params,
}: {
  params: { projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecordAdmin, { id: projectRecordId })

  return (
    <>
      <PageHeader title="Admin: Protokoll bearbeiten" className="mt-12" />
      <AdminEditProjectRecordForm projectRecord={projectRecord} />
    </>
  )
}
