import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsectionStatusForm } from "@/src/components/subsection-status/NewSubsectionStatusForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsection-status/new/")

export function PageSubsectionStatusNew() {
  const { projectSlug } = routeApi.useParams()

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
    </>
  )
}
