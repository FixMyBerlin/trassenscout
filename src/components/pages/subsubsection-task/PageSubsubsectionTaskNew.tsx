import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { NewSubsubsectionTaskForm } from "@/src/components/subsubsection-task/NewSubsubsectionTaskForm"
import { useSubsubsectionTaskRouteLinks } from "@/src/components/subsubsection-task/useSubsubsectionTaskActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-task/new/")

export function PageSubsubsectionTaskNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useSubsubsectionTaskRouteLinks(projectSlug, search)

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Aufgaben"
            sectionTo="/$projectSlug/subsubsection-task"
            current="Aufgabe hinzufügen"
          />
        }
        title="Aufgabe hinzufügen"
      />
      <NewSubsubsectionTaskForm projectSlug={projectSlug} />
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zur Übersicht</Link>
    </>
  )
}
