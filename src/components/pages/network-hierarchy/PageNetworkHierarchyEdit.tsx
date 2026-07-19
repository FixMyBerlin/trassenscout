import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { EditNetworkHierarchyForm } from "@/src/components/network-hierarchy/EditNetworkHierarchyForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/network-hierarchy/$networkHierarchyId/edit/",
)

export function PageNetworkHierarchyEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.networkHierarchyId)
  const { data: networkHierarchy } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "networkHierarchies", id: rowId }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Netzstufen"
            sectionTo="/$projectSlug/network-hierarchy"
            current="bearbeiten"
          />
        }
      />
      <EditNetworkHierarchyForm
        networkHierarchy={networkHierarchy as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
