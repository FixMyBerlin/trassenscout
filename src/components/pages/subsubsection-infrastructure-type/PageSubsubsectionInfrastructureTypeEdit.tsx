import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { EditSubsubsectionInfrastructureTypeForm } from "@/src/components/subsubsection-infrastructure-type/EditSubsubsectionInfrastructureTypeForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-infrastructure-type/$subsubsectionInfrastructureTypeId/edit/",
)

export function PageSubsubsectionInfrastructureTypeEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.subsubsectionInfrastructureTypeId)
  const { data: subsubsectionInfrastructureType } = useSuspenseQuery(
    adminLookupRowQueryOptions({
      projectSlug,
      table: "subsubsectionInfrastructureTypes",
      id: rowId,
    }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Infrastrukturtypen"
            sectionTo="/$projectSlug/subsubsection-infrastructure-type"
            current="Infrastrukturtyp bearbeiten"
          />
        }
        title="Infrastrukturtyp bearbeiten"
      />
      <EditSubsubsectionInfrastructureTypeForm
        subsubsectionInfrastructureType={subsubsectionInfrastructureType as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
