import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProtocolEmails from "@/src/server/protocol-emails/queries/getProtocolEmails"
import { Metadata } from "next"
import "server-only"
import { ProtocolEmailsTable } from "./_components/ProtocolEmailsTable"

export const metadata: Metadata = {
  title: "Protokoll-E-Mails",
}

export default async function ProtocolEmailsPage() {
  const protocolEmails = await invoke(getProtocolEmails, {})

  return (
    <>
      <PageHeader title="Protokoll-E-Mails" className="mt-12" />
      <ProtocolEmailsTable protocolEmails={protocolEmails} />
    </>
  )
}
