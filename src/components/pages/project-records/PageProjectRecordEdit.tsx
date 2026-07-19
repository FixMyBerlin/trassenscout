import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { EditProjectRecordForm } from "@/src/components/project-records/EditProjectRecordForm"
import { projectRecordQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/project-records/$projectRecordId/edit/",
)

export function PageProjectRecordEdit() {
  const { projectSlug, projectRecordId } = routeApi.useParams()
  const id = Number(projectRecordId)
  const { data: projectRecord } = useSuspenseQuery(projectRecordQueryOptions({ projectSlug, id }))

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Projektprotokoll"
            sectionTo="/$projectSlug/project-records"
            current="bearbeiten"
          />
        }
      />
      <EditProjectRecordForm projectRecord={projectRecord} />
    </>
  )
}
