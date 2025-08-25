import { EditProtocolForm } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/[protocolId]/edit/_components/EditProtocolForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Projektprotokoll bearbeiten",
}

export default async function EditProtocolPage({
  params,
}: {
  params: { projectSlug: string; protocolId: string }
}) {
  const protocolId = parseInt(params.protocolId)
  const protocol = await invoke(getProtocol, {
    projectSlug: params.projectSlug,
    id: protocolId,
  })

  return (
    <>
      <PageHeader title="Projektprotokoll bearbeiten" className="mt-12" />

      <EditProtocolForm
        initialProtocol={protocol}
        projectSlug={params.projectSlug}
        protocolId={protocolId}
      />
    </>
  )
}
