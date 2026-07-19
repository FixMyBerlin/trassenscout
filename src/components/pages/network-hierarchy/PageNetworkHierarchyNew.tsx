import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { NewNetworkHierarchyForm } from "@/src/components/network-hierarchy/NewNetworkHierarchyForm"
import { useNetworkHierarchyRouteLinks } from "@/src/components/network-hierarchy/useNetworkHierarchyActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/network-hierarchy/new/")

export function PageNetworkHierarchyNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useNetworkHierarchyRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Netzstufen"
            sectionTo="/$projectSlug/network-hierarchy"
            current="neu"
          />
        }
      />
      <NewNetworkHierarchyForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
