import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { ZeroCase } from "@/src/components/core/components/text/ZeroCase"
import { ProjectRecordsNeedsReviewInfoBanner } from "@/src/components/project-records/ProjectRecordNeedsReviewBanner"
import { ProjectRecordsTable } from "@/src/components/project-records/ProjectRecordTable"
import { projectRecordsNeedsReviewQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export const ProjectRecordsNeedsReviewContent = () => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: projectRecords } = useSuspenseQuery(
    projectRecordsNeedsReviewQueryOptions({ projectSlug }),
  )

  if (projectRecords.length === 0) {
    return (
      <ZeroCase
        visible={projectRecords.length}
        text="Momentan gibt es keine Protokolleinträge, die Bestätigung benötigen."
      />
    )
  }

  return (
    <>
      <ProjectRecordsNeedsReviewInfoBanner />
      <ProjectRecordsTable projectRecords={projectRecords} />
    </>
  )
}
