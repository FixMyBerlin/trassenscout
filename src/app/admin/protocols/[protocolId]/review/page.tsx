import { AdminReviewProtocolForm } from "@/src/app/admin/protocols/[protocolId]/review/_components/AdminReviewProtocolForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links/Link"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocolAdmin from "@/src/server/protocols/queries/getProtocolAdmin"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Protokoll Review",
}

export default async function AdminReviewProtocolPage({
  params,
}: {
  params: { protocolId: string }
}) {
  const protocolId = parseInt(params.protocolId)
  const protocol = await invoke(getProtocolAdmin, { id: protocolId })

  return (
    <>
      <PageHeader
        title={`Review: ${protocol.title}`}
        className="mt-12"
        action={
          <div className="flex flex-col gap-2">
            <Link icon="edit" href={`/admin/protocols/${protocolId}/edit`}>
              Bearbeiten
            </Link>
          </div>
        }
      />
      <AdminReviewProtocolForm initialProtocol={protocol} protocolId={protocolId} />
    </>
  )
}
