import { getRouteApi } from "@tanstack/react-router"
import { NewAcquisitionAreaStatusForm } from "@/src/components/acquisition-area-status/NewAcquisitionAreaStatusForm"
import { useAcquisitionAreaStatusRouteLinks } from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/acquisition-area-status/new/")

export function PageAcquisitionAreaStatusNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useAcquisitionAreaStatusRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Flächenerwerb-Status"
            sectionTo="/$projectSlug/acquisition-area-status"
            current="Status hinzufügen"
          />
        }
        title="Status hinzufügen"
      />
      <NewAcquisitionAreaStatusForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
