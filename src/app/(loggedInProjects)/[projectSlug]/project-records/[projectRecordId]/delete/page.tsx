import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { H3 } from "@/src/core/components/text"
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
      <div className="mb-8 max-w-3xl">
        <H3>Verknüpfte Dokumente</H3>
        <p>
          Der Protokolleintrag <em>{deleteInfo.projectRecord.title}</em> hat{" "}
          {deleteInfo.uploads.length} verknüpfte Dokument
          {deleteInfo.uploads.length !== 1 ? "e" : ""}.
        </p>
        <p>
          Entscheiden Sie für jedes Dokument, ob es zusammen mit dem Protokolleintrag gelöscht oder
          unabhängig vom Protokolleintrag gespeichert werden soll. Beachten Sie, dass Dokumente auch
          mit weitere Verknüpfungen haben können.
        </p>
      </div>
      <DeleteProjectRecordWithUploadsClient
        deleteInfo={deleteInfo}
        projectSlug={params.projectSlug}
      />
    </>
  )
}
