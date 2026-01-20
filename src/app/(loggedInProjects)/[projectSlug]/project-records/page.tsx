import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import getProjectRecords from "@/src/server/projectRecords/queries/getProjectRecords"
import { Metadata } from "next"
import "server-only"
import { ProjectRecordsFormAndTable } from "./_components/ProjectRecordsFormAndTable"
import { getProjectRecordsTabs } from "./_utils/projectRecordsTabs"

export const metadata: Metadata = {
  title: "Projektprotokoll",
}

export default async function ProjectProjectRecordsPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  const projectRecords = await invoke(getProjectRecords, { projectSlug: params.projectSlug })
  const tabs = await getProjectRecordsTabs(params.projectSlug)

  return (
    <>
      <PageHeader title="Projektprotokoll" className="mt-12" />
      <TabsApp tabs={tabs} className="mt-7" />
      <ProjectRecordsFormAndTable initialProjectRecords={projectRecords} />
    </>
  )
}
