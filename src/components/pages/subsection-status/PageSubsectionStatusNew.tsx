import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsectionStatusForm } from "@/src/components/subsection-status/NewSubsectionStatusForm"
import { useSubsectionStatusRouteLinks } from "@/src/components/subsection-status/useSubsectionStatusActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsection-status/new/")

export function PageSubsectionStatusNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useSubsectionStatusRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Status"
            sectionTo="/$projectSlug/subsection-status"
            current="neu"
          />
        }
      />
      <NewSubsectionStatusForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
