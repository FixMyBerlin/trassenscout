import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { NewSubsubsectionSpecialForm } from "@/src/components/subsubsection-special/NewSubsubsectionSpecialForm"
import { useSubsubsectionSpecialRouteLinks } from "@/src/components/subsubsection-special/useSubsubsectionSpecialActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-special/new/")

export function PageSubsubsectionSpecialNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useSubsubsectionSpecialRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Besonderheiten"
            sectionTo="/$projectSlug/subsubsection-special"
            current="Besonderheit hinzufügen"
          />
        }
        title="Besonderheit hinzufügen"
      />
      <NewSubsubsectionSpecialForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
