import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { AcquisitionAreaStatusesTable } from "@/src/components/acquisition-area-status/AcquisitionAreaStatusesTable"
import { useAcquisitionAreaStatusRouteLinks } from "@/src/components/acquisition-area-status/useAcquisitionAreaStatusActions"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/acquisition-area-status/")

export function PageAcquisitionAreaStatus() {
  const { projectSlug } = routeApi.useParams()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useAcquisitionAreaStatusRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "acquisitionAreaStatuses" }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader breadcrumb={<ProjectPageBreadcrumb section="Flächenerwerb-Status" />} />
      <AcquisitionAreaStatusesTable acquisitionAreaStatuses={rows} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neuer Status
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ acquisitionAreaStatuses: rows }} />
    </>
  )
}
