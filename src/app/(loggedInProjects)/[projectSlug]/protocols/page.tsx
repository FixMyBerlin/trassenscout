import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { Metadata } from "next"
import "server-only"
import { ProtocolsFormAndTable } from "./_components/ProtocolsFormAndTable"

export const metadata: Metadata = {
  title: "Projektprotokoll",
}

export default async function ProjectProtocolsPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  const protocols = await invoke(getProtocols, { projectSlug: params.projectSlug })

  return (
    <>
      <PageHeader title="Projektprotokoll" className="mt-12" />
      <ProtocolsFormAndTable initialProtocols={protocols} />
    </>
  )
}
