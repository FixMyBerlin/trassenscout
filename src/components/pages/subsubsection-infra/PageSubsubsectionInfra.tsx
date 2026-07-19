import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { SubsubsectionInfrasTable } from "@/src/components/subsubsection-infra/SubsubsectionInfrasTable"
import { useSubsubsectionInfraRouteLinks } from "@/src/components/subsubsection-infra/useSubsubsectionInfraActions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infra/")

export function PageSubsubsectionInfra() {
  const { projectSlug } = routeApi.useParams()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useSubsubsectionInfraRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionInfras" }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Infrastruktur" />}
        title="Infrastruktur"
      />
      <SubsubsectionInfrasTable subsubsectionInfras={rows} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neue Infrastruktur
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionInfras: rows }} />
    </>
  )
}
