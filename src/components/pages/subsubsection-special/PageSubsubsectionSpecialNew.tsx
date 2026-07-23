import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsubsectionSpecialForm } from "@/src/components/subsubsection-special/NewSubsubsectionSpecialForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-special/new/")

export function PageSubsubsectionSpecialNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Besonderheiten"
            sectionTo="/$projectSlug/subsubsection-special"
            current="neu"
          />
        }
      />
      <NewSubsubsectionSpecialForm projectSlug={projectSlug} />
    </>
  )
}
