import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectRecordsNeedsReviewInfoBanner } from "@/src/components/project-records/ProjectRecordNeedsReviewBanner"
import { ProjectRecordsTable } from "@/src/components/project-records/ProjectRecordTable"
import { useProjectRecordsListHeader } from "@/src/components/project-records/useProjectRecordsListHeader"
import { projectRecordsNeedsReviewQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export const ProjectRecordsNeedsReviewContent = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { breadcrumb, tabs } = useProjectRecordsListHeader()
  const { data: projectRecords } = useSuspenseQuery(
    projectRecordsNeedsReviewQueryOptions({ projectSlug }),
  )

  return (
    <>
      <PageHeader breadcrumb={breadcrumb} tabs={tabs} />
      {projectRecords.length === 0 ? (
        <ZeroCase
          visible={projectRecords.length}
          text="Momentan gibt es keine Protokolleinträge, die Bestätigung benötigen."
        />
      ) : (
        <>
          <ProjectRecordsNeedsReviewInfoBanner />
          <ProjectRecordsTable projectRecords={projectRecords} />
        </>
      )}
    </>
  )
}
