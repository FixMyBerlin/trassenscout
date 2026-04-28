import { invoke } from "@/src/blitz-server"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import { Metadata } from "next"
import "server-only"
import { ProjectRecordsFormAndTable } from "../_components/ProjectRecordsFormAndTable"

export const metadata: Metadata = {
  title: "Projektprotokoll",
}

export default async function ProjectProjectRecordsPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  const projectRecords = await invoke(getProjectRecords, { projectSlug: params.projectSlug })

  return <ProjectRecordsFormAndTable initialProjectRecords={projectRecords} />
}
