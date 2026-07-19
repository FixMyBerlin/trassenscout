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
import { SubsubsectionSpecialsTable } from "@/src/components/subsubsection-special/SubsubsectionSpecialsTable"
import { useSubsubsectionSpecialRouteLinks } from "@/src/components/subsubsection-special/useSubsubsectionSpecialActions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-special/")

export function PageSubsubsectionSpecial() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useSubsubsectionSpecialRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "subsubsectionSpecials",
    }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Besonderheiten" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neue Besonderheit
            </Link>
          ) : undefined
        }
      />
      <SubsubsectionSpecialsTable subsubsectionSpecials={rows} />
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ subsubsectionSpecials: rows }} />
    </>
  )
}
