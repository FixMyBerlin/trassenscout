import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsubsectionTaskForm } from "@/src/components/subsubsection-task/NewSubsubsectionTaskForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-task/new/")

export function PageSubsubsectionTaskNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Aufgaben"
            sectionTo="/$projectSlug/subsubsection-task"
            current="neu"
          />
        }
      />
      <NewSubsubsectionTaskForm projectSlug={projectSlug} />
    </>
  )
}
