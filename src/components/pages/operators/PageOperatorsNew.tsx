import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { NewOperatorForm } from "@/src/components/operators/NewOperatorForm"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/new/")

export function PageOperatorsNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Baulastträger"
            sectionTo="/$projectSlug/operators"
            current="neu"
          />
        }
      />
      <NewOperatorForm projectSlug={projectSlug} />
    </>
  )
}
