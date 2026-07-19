import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { SubsubsectionInfrasTable } from "@/src/components/subsubsection-infra/SubsubsectionInfrasTable"
import { useSubsubsectionInfraRouteLinks } from "@/src/components/subsubsection-infra/useSubsubsectionInfraActions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-infra/")

export function PageSubsubsectionInfra() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useSubsubsectionInfraRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "subsubsectionInfras",
    }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Infrastruktur" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neue Infrastruktur
            </Link>
          ) : undefined
        }
      />
      <SubsubsectionInfrasTable subsubsectionInfras={rows} />
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionInfras: rows }} />
    </>
  )
}
