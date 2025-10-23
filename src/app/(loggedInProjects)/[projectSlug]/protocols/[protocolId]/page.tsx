import { ProtocolDetailClient } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/[protocolId]/_components/ProtocolDetailClient"
import { CreateEditReviewHistory } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/CreateEditReviewHistory"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocol from "@/src/server/protocols/queries/getProtocol"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Projektprotokoll",
}

export default async function ProtocolDetail({
  params,
}: {
  params: { projectSlug: string; protocolId: string }
}) {
  const protocolId = parseInt(params.protocolId)
  const protocol = await invoke(getProtocol, { projectSlug: params.projectSlug, id: protocolId })

  return (
    <>
      <PageHeader
        title={protocol.title}
        className="mt-12"
        action={
          <IfUserCanEdit>
            <Link icon="edit" href={`/${params.projectSlug}/protocols/${protocolId}/edit`}>
              Bearbeiten
            </Link>
          </IfUserCanEdit>
        }
      />

      <CreateEditReviewHistory protocol={protocol} />

      <ProtocolDetailClient protocol={protocol} protocolId={protocolId} />

      <div className="mt-8 border-t border-gray-200 pt-4">
        <Link href={`/${params.projectSlug}/protocols`}>← Zurück zur Protokoll-Übersicht</Link>
      </div>
    </>
  )
}
