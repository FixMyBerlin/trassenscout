import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { TabsApp } from "@/src/core/components/Tabs/TabsApp"
import { ZeroCase } from "@/src/core/components/text/ZeroCase"
import getProjectRecordsNeedsReview from "@/src/server/projectRecords/queries/getProjectRecordsNeedsReview"
import { AuthorizationError } from "blitz"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import "server-only"
import { ProjectRecordsNeedsReviewInfoBanner } from "../_components/ProjectRecordNeedsReviewBanner"
import { ProjectRecordsTable } from "../_components/ProjectRecordTable"
import { getProjectRecordsTabs } from "../_utils/projectRecordsTabs"

export const metadata: Metadata = {
  title: "Bestätigung erforderlich - Projektprotokoll",
}

export default async function ProjectRecordsNeedsReviewPage({
  params,
}: {
  params: { projectSlug: string }
}) {
  // The query already checks editor permissions via authorizeProjectMember in its resolver pipe
  // If unauthorized, it will throw AuthorizationError which we catch and redirect
  let projectRecords
  try {
    projectRecords = await invoke(getProjectRecordsNeedsReview, {
      projectSlug: params.projectSlug,
    })
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect(`/${params.projectSlug}/project-records`)
    }
    throw error
  }

  const tabs = await getProjectRecordsTabs(params.projectSlug)

  return (
    <>
      <PageHeader title="Projektprotokoll" className="mt-12" />
      <TabsApp tabs={tabs} className="mt-7" />
      {projectRecords.length === 0 ? (
        <ZeroCase
          visible={projectRecords.length}
          text="Momentan gibt es keine Protokolleinträge, die Bestätigung benötigen."
        />
      ) : (
        <>
          <ProjectRecordsNeedsReviewInfoBanner />
          <ProjectRecordsTable projectRecords={projectRecords} withSubsection withSubsubsection />
        </>
      )}
    </>
  )
}
