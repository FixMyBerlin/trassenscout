import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { SubsectionStatusesTable } from "@/src/components/subsection-status/SubsectionStatusesTable"
import { useSubsectionStatusRouteLinks } from "@/src/components/subsection-status/useSubsectionStatusActions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsection-status/")

export function PageSubsectionStatus() {
  const { projectSlug } = routeApi.useParams()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useSubsectionStatusRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsectionStatuses" }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Status" />} title="Status" />
      <SubsectionStatusesTable subsectionStatuss={rows} projectSlug={projectSlug} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neuer Status
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsectionStatuss: rows }} />
    </>
  )
}
