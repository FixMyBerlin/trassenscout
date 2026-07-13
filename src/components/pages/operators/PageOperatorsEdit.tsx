import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { EditOperatorForm } from "@/src/components/operators/EditOperatorForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/operators/$operatorId/edit/")

export function PageOperatorsEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.operatorId)
  const { data: operator } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "operators", id: rowId }),
  )

  return (
    <>
      <PageHeader title="Baulastträger bearbeiten" />
      <EditOperatorForm operator={operator as never} projectSlug={projectSlug} />
    </>
  )
}
