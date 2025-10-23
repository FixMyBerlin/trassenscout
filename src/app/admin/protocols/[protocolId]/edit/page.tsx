import { AdminEditProtocolForm } from "@/src/app/admin/protocols/[protocolId]/edit/_components/AdminEditProtocolForm"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocolAdmin from "@/src/server/protocols/queries/getProtocolAdmin"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Protokoll bearbeiten",
}

export default async function AdminEditProtocolPage({
  params,
}: {
  params: { protocolId: string }
}) {
  const protocolId = parseInt(params.protocolId)
  const protocol = await invoke(getProtocolAdmin, { id: protocolId })

  return (
    <>
      <PageHeader title="Admin: Protokoll bearbeiten" className="mt-12" />
      <AdminEditProtocolForm initialProtocol={protocol} protocolId={protocolId} />
    </>
  )
}
