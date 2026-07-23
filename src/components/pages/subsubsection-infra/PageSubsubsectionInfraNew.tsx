import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsubsectionInfraForm } from "@/src/components/subsubsection-infra/NewSubsubsectionInfraForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infra/new/")

export function PageSubsubsectionInfraNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Infrastruktur"
            sectionTo="/$projectSlug/subsubsection-infra"
            current="neu"
          />
        }
      />
      <NewSubsubsectionInfraForm projectSlug={projectSlug} />
    </>
  )
}
