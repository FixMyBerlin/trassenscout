import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { OperatorsTable } from "@/src/components/operators/OperatorsTable"
import { useOperatorRouteLinks } from "@/src/components/operators/useOperatorActions"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { operatorsPaginatedQueryOptions } from "@/src/server/operators/operatorsQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/")

export function PageOperators() {
  const { projectSlug } = routeApi.useParams()
  const { page, pageSize } = routeApi.useSearch()
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useOperatorRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(operatorsPaginatedQueryOptions({ projectSlug, page, pageSize }))

  return (
    <>
      <PageHeader title="Baulastträger" />
      <OperatorsTable operators={data.rows} pagination={data} />
      <IfUserCanEdit>
        <Link button="blue" icon="plus" className="mt-4" {...newLink}>
          Neuer Baulastträger
        </Link>
      </IfUserCanEdit>
      <IfUserCanEdit>
        <ConditionalBackLink fromPath={fromPath} />
      </IfUserCanEdit>
      <SuperAdminLogData data={{ operators: data.rows }} />
    </>
  )
}
