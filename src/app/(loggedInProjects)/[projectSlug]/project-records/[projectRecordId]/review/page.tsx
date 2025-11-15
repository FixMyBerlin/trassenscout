import { ReviewProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/[projectRecordId]/review/_components/ReviewProtocolForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links/Link"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { projectRecordEditRoute } from "@/src/core/routes/projectRecordRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Protokoll Freigabe",
}

export default async function ReviewProjectRecordPage({
  params,
}: {
  params: { projectRecordId: string; projectSlug: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecord, {
    id: projectRecordId,
    projectSlug: params.projectSlug,
  })

  return (
    <>
      <PageHeader
        title={`Freigabe: ${projectRecord.title}`}
        subtitle="Dieses Protokoll wurde per KI erstellt und muss noch freigegeben werden."
        className="mt-12"
        action={
          <div className="flex flex-col gap-2">
            <Link icon="edit" href={projectRecordEditRoute(params.projectSlug, projectRecordId)}>
              Bearbeiten
            </Link>
          </div>
        }
      />
      <ReviewProjectRecordForm
        initialProjectRecord={projectRecord}
        projectRecordId={projectRecordId}
      />
    </>
  )
}
