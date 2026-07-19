import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { NewSubsubsectionInfraForm } from "@/src/components/subsubsection-infra/NewSubsubsectionInfraForm"
import { useSubsubsectionInfraRouteLinks } from "@/src/components/subsubsection-infra/useSubsubsectionInfraActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infra/new/")

export function PageSubsubsectionInfraNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useSubsubsectionInfraRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Infrastruktur"
            sectionTo="/$projectSlug/subsubsection-infra"
            current="Infrastruktur hinzufügen"
          />
        }
        title="Infrastruktur hinzufügen"
      />
      <NewSubsubsectionInfraForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
