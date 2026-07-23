import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsubsectionStatusForm } from "@/src/components/subsubsection-status/NewSubsubsectionStatusForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-status/new/")

export function PageSubsubsectionStatusNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Phase"
            sectionTo="/$projectSlug/subsubsection-status"
            current="neu"
          />
        }
      />
      <NewSubsubsectionStatusForm projectSlug={projectSlug} />
    </>
  )
}
