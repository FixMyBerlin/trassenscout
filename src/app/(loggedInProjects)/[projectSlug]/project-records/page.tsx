import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getProjectRecords from "@/src/server/projectRecord/queries/getProjectRecords"
import { Metadata } from "next"
import "server-only"
import { ProjectRecordsFormAndTable } from "./_components/ProjectRecordsFormAndTable"

export const metadata: Metadata = {
  title: "Projektprotokoll",
}

export default async function ProjectProjectRecordsPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  const projectRecords = await invoke(getProjectRecords, { projectSlug: params.projectSlug })

  return (
    <>
      <PageHeader title="Projektprotokoll" className="mt-12" />
      <ProjectRecordsFormAndTable initialProjectRecords={projectRecords} />
    </>
  )
}
