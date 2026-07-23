import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { EditOperatorForm } from "@/src/components/operators/EditOperatorForm"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
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
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Baulastträger"
            sectionTo="/$projectSlug/operators"
            item={"slug" in operator ? shortTitle(operator.slug) : undefined}
            current="bearbeiten"
          />
        }
      />
      <EditOperatorForm operator={operator as never} projectSlug={projectSlug} />
    </>
  )
}
