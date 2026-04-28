import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import "server-only"
import { getProjectRecordsTabs } from "../_utils/projectRecordsTabs"

export default async function ProjectRecordsTabsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { projectSlug: string }
}) {
  const tabs = await getProjectRecordsTabs(params.projectSlug)

  return (
    <>
      <PageHeader title="Projektprotokoll" className="mt-12" />
      <TabsApp tabs={tabs} className="mt-7" />
      {children}
    </>
  )
}
