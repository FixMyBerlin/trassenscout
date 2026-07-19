import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { NewOperatorForm } from "@/src/components/operators/NewOperatorForm"
import { useOperatorRouteLinks } from "@/src/components/operators/useOperatorActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/new/")

export function PageOperatorsNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useOperatorRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Baulastträger"
            sectionTo="/$projectSlug/operators"
            current="neu"
          />
        }
      />
      <NewOperatorForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
