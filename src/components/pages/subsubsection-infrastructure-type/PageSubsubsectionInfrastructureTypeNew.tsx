import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { NewSubsubsectionInfrastructureTypeForm } from "@/src/components/subsubsection-infrastructure-type/NewSubsubsectionInfrastructureTypeForm"
import { useSubsubsectionInfrastructureTypeRouteLinks } from "@/src/components/subsubsection-infrastructure-type/useSubsubsectionInfrastructureTypeActions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/new/",
)

export function PageSubsubsectionInfrastructureTypeNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useSubsubsectionInfrastructureTypeRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader title="Infrastrukturtyp hinzufügen" />
      <NewSubsubsectionInfrastructureTypeForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
