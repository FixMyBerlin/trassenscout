import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { EditAcquisitionAreaStatusForm } from "@/src/components/acquisition-area-status/EditAcquisitionAreaStatusForm"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
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
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Flächenerwerb-Status"
            sectionTo="/$projectSlug/acquisition-area-status"
            item={
              "slug" in acquisitionAreaStatus ? shortTitle(acquisitionAreaStatus.slug) : undefined
            }
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
