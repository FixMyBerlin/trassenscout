import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { QualityLevelsTable } from "@/src/components/quality-levels/QualityLevelsTable"
import { useQualityLevelRouteLinks } from "@/src/components/quality-levels/useQualityLevelActions"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/quality-levels/")

export function PageQualityLevels() {
  const { projectSlug } = routeApi.useParams()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useQualityLevelRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "qualityLevels" }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader title="Ausbaustandards" />
      <QualityLevelsTable qualityLevels={rows} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neuer Ausbaustandard
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ qualityLevels: rows }} />
    </>
  )
}
