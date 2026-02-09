import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecordDeleteInfo from "@/src/server/projectRecords/queries/getProjectRecordDeleteInfo"
import { Metadata } from "next"
import "server-only"
import { DeleteProjectRecordWithUploadsClient } from "./_components/DeleteProjectRecordWithUploadsClient"

export const metadata: Metadata = {
  title: "Protokolleintrag und verknüpfte Dokumente löschen",
}

export default async function DeleteProjectRecordPage({
  params,
}: {
  params: { projectSlug: string; projectRecordId: string }
}) {
  const projectRecordId = parseInt(params.projectRecordId)
  const deleteInfo = await invoke(getProjectRecordDeleteInfo, {
    projectSlug: params.projectSlug,
    id: projectRecordId,
  })

  return (
    <>
      <PageHeader
        title="Protokolleintrag und verknüpfte Dokumente löschen"
        className="mt-12"
        description={`Wollen Sie Protokolleintrag mit ID ${projectRecordId} unwiderruflich löschen?`}
      />
      <>
        <p className="mb-6">
          Der Protokolleintrag <strong>{deleteInfo.projectRecord.title}</strong> hat{" "}
          {deleteInfo.uploads.length} verknüpfte Dokument
          {deleteInfo.uploads.length !== 1 ? "e" : ""}. Entscheiden Sie für jedes Dokument, ob es
          zusammen mit dem Protokolleintrag gelöscht oder unabhängig vom Protokolleintrag
          gespeichert werden soll. Beachten Sie, dass einige Dokumente, die mit diesem
          Protokolleintrag verknüpft sind, auch weitere Verknüpfungen haben.
        </p>
        <DeleteProjectRecordWithUploadsClient
          deleteInfo={deleteInfo}
          projectSlug={params.projectSlug}
        />
      </>
    </>
  )
}
