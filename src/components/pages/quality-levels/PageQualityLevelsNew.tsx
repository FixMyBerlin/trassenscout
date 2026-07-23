import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { NewQualityLevelForm } from "@/src/components/quality-levels/NewQualityLevelForm"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/quality-levels/new/")

export function PageQualityLevelsNew() {
  const { projectSlug } = routeApi.useParams()

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Ausbaustandards"
            sectionTo="/$projectSlug/quality-levels"
            current="neu"
          />
        }
      />
      <NewQualityLevelForm projectSlug={projectSlug} />
    </>
  )
}
