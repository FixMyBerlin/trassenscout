import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { NetworkHierarchysTable } from "@/src/components/network-hierarchy/NetworkHierarchysTable"
import { useNetworkHierarchyRouteLinks } from "@/src/components/network-hierarchy/useNetworkHierarchyActions"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/network-hierarchy/")

export function PageNetworkHierarchy() {
  const { projectSlug } = routeApi.useParams()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useNetworkHierarchyRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "networkHierarchies" }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader title="Netzstufen" />
      <NetworkHierarchysTable networkHierarchys={rows} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neue Netzstufe
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ networkHierarchys: rows }} />
    </>
  )
}
