import { AdminProtocolsTable } from "@/src/app/admin/protocols/_components/AdminProtocolsTable"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getAllProtocolsAdmin from "@/src/server/protocols/queries/getAllProtocolsAdmin"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Admin: Alle Protokolle",
}

export default async function AdminProtocolsPage() {
  const protocols = await invoke(getAllProtocolsAdmin, {})

  return (
    <>
      <PageHeader title="Admin: Alle Protokolle" className="mt-12" />
      <AdminProtocolsTable protocols={protocols} />
    </>
  )
}
