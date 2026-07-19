import { getRouteApi } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearch } from "@/src/components/core/routes/useTryRouteSearch"
import { NewQualityLevelForm } from "@/src/components/quality-levels/NewQualityLevelForm"
import { useQualityLevelRouteLinks } from "@/src/components/quality-levels/useQualityLevelActions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/quality-levels/new/")

export function PageQualityLevelsNew() {
  const { projectSlug } = routeApi.useParams()
  const search = useTryRouteSearch() ?? {}
  const { listLink } = useQualityLevelRouteLinks(projectSlug, search)

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
      <hr className="my-5 text-gray-200" />
      <Link {...listLink}>Zurück zu den Ausbaustandards</Link>
    </>
  )
}
