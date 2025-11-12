import { AdminReviewProjectRecordForm } from "@/src/app/admin/project-records/[projectRecordId]/review/_components/AdminReviewProjectRecordForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links/Link"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecordAdmin from "@/src/server/projectRecords/queries/getProjectRecordAdmin"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Protokoll Review",
}

export default async function AdminReviewProjectRecordPage({
  params,
}: {
  params: { projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecordAdmin, { id: projectRecordId })

  return (
    <>
      <PageHeader
        title={`Review: ${projectRecord.title}`}
        className="mt-12"
        action={
          <div className="flex flex-col gap-2">
            <Link icon="edit" href={`/admin/project-records/${projectRecordId}/edit`}>
              Bearbeiten
            </Link>
          </div>
        }
      />
      <AdminReviewProjectRecordForm
        initialProjectRecord={projectRecord}
        projectRecordId={projectRecordId}
      />
    </>
  )
}
