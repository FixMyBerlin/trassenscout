import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { SubsubsectionInfrastructureTypesTable } from "@/src/components/subsubsection-infrastructure-type/SubsubsectionInfrastructureTypesTable"
import { useSubsubsectionInfrastructureTypeRouteLinks } from "@/src/components/subsubsection-infrastructure-type/useSubsubsectionInfrastructureTypeActions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/")

export function PageSubsubsectionInfrastructureType() {
  const { projectSlug } = routeApi.useParams()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useSubsubsectionInfrastructureTypeRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "subsubsectionInfrastructureTypes",
    }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader title="Infrastrukturtypen" />
      <SubsubsectionInfrastructureTypesTable subsubsectionInfrastructureTypes={rows} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neuer Infrastrukturtyp
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionInfrastructureTypes: rows }} />
    </>
  )
}
