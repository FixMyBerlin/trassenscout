import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjects from "@/src/server/projects/queries/getProjects"
import getProtocolEmail from "@/src/server/protocol-emails/queries/getProtocolEmail"
import { Metadata } from "next"
import "server-only"
import { EditProtocolEmailForm } from "./_components/EditProtocolEmailForm"

export const metadata: Metadata = {
  title: "Protokoll-E-Mail bearbeiten",
}

export default async function EditProtocolEmailPage({
  params,
}: {
  params: { protocolEmailId: string }
}) {
  const protocolEmailId = parseInt(params.protocolEmailId)
  const protocolEmail = await invoke(getProtocolEmail, {
    id: protocolEmailId,
  })
  const { projects } = await invoke(getProjects, {})

  return (
    <>
      <PageHeader title="Protokoll-E-Mail bearbeiten" className="mt-12" />

      <EditProtocolEmailForm
        initialProtocolEmail={protocolEmail}
        protocolEmailId={protocolEmailId}
        projects={projects}
      />
    </>
  )
}
