import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { NewNetworkHierarchyForm } from "@/src/components/network-hierarchy/NewNetworkHierarchyForm"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/network-hierarchy/new/")

export function PageNetworkHierarchyNew() {
  const { projectSlug } = routeApi.useParams()

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
    </>
  )
}
