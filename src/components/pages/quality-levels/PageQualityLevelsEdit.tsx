import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { EditQualityLevelForm } from "@/src/components/quality-levels/EditQualityLevelForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/quality-levels/$qualityLevelId/edit/")

export function PageQualityLevelsEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.qualityLevelId)
  const { data: qualityLevel } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "qualityLevels", id: rowId }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Ausbaustandards"
            sectionTo="/$projectSlug/quality-levels"
            current="bearbeiten"
          />
        }
      />
      <EditQualityLevelForm qualityLevel={qualityLevel as never} projectSlug={projectSlug} />
    </>
  )
}
