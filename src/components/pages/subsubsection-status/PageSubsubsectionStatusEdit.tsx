import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { EditSubsubsectionStatusForm } from "@/src/components/subsubsection-status/EditSubsubsectionStatusForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-status/$subsubsectionStatusId/edit/",
)

export function PageSubsubsectionStatusEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.subsubsectionStatusId)
  const { data: subsubsectionStatus } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "subsubsectionStatuses", id: rowId }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Status"
            sectionTo="/$projectSlug/subsubsection-status"
            current="bearbeiten"
          />
        }
      />
      <EditSubsubsectionStatusForm
        subsubsectionStatus={subsubsectionStatus as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
