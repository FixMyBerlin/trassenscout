import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewSubsubsectionInfrastructureTypeForm } from "@/src/components/subsubsection-infrastructure-type/NewSubsubsectionInfrastructureTypeForm"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/new/",
)

export function PageSubsubsectionInfrastructureTypeNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Infrastrukturtypen"
            sectionTo="/$projectSlug/subsubsection-infrastructure-type"
            current="neu"
          />
        }
      />
      <NewSubsubsectionInfrastructureTypeForm projectSlug={projectSlug} />
    </>
  )
}
