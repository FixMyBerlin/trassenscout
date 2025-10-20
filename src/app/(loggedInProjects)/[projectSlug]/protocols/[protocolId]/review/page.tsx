import { ReviewProtocolForm } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/[protocolId]/review/_components/ReviewProtocolForm"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links/Link"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Protokoll Freigabe",
}

export default async function ReviewProtocolPage({
  params,
}: {
  params: { protocolId: string; projectSlug: string }
}) {
  const protocolId = parseInt(params.protocolId)
  const protocol = await invoke(getProtocol, { id: protocolId, projectSlug: params.projectSlug })

  return (
    <>
      <PageHeader
        title={`Freigabe: ${protocol.title}`}
        subtitle="Dieses Protokoll wurde per KI erstellt und muss noch freigegeben werden."
        className="mt-12"
        action={
          <div className="flex flex-col gap-2">
            <Link icon="edit" href={`/${params.projectSlug}/protocols/${protocolId}/edit`}>
              Bearbeiten
            </Link>
          </div>
        }
      />
      <ReviewProtocolForm initialProtocol={protocol} protocolId={protocolId} />
    </>
  )
}
