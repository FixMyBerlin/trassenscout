import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { EditAcquisitionAreaStatusForm } from "@/src/components/acquisition-area-status/EditAcquisitionAreaStatusForm"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/acquisition-area-status/$acquisitionAreaStatusId/edit/",
)

export function PageAcquisitionAreaStatusEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.acquisitionAreaStatusId)
  const { data: acquisitionAreaStatus } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "acquisitionAreaStatuses", id: rowId }),
  )

  return (
    <>
      <PageHeader
        title="Status bearbeiten"
        titleVisuallyHidden
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Flächenerwerb-Status"
            sectionTo="/$projectSlug/acquisition-area-status"
            item={"title" in acquisitionAreaStatus ? acquisitionAreaStatus.title : undefined}
            current="bearbeiten"
          />
        }
      />
      <EditAcquisitionAreaStatusForm
        acquisitionAreaStatus={acquisitionAreaStatus as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
