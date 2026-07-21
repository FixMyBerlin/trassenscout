import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsubsectionStatusForm } from "@/src/components/subsubsection-status/NewSubsubsectionStatusForm"
import { useSubsubsectionStatusRouteLinks } from "@/src/components/subsubsection-status/useSubsubsectionStatusActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-status/new/")

export function PageSubsubsectionStatusNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useSubsubsectionStatusRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Status"
            sectionTo="/$projectSlug/subsubsection-status"
            current="neu"
          />
        }
      />
      <NewSubsubsectionStatusForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
