import { EditProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/[projectRecordId]/edit/_components/EditProjectRecordForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"

import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Projektprotokoll bearbeiten",
}

export default async function EditProjectRecordPage({
  params,
}: {
  params: { projectSlug: string; projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const projectRecord = await invoke(getProjectRecord, {
    projectSlug: params.projectSlug,
    id: projectRecordId,
  })

  return (
    <>
      <PageHeader title="Projektprotokoll bearbeiten" className="mt-12" />

      <EditProjectRecordForm projectRecord={projectRecord} projectSlug={params.projectSlug} />
    </>
  )
}
