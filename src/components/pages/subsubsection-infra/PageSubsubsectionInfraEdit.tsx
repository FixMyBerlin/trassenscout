import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { EditSubsubsectionInfraForm } from "@/src/components/subsubsection-infra/EditSubsubsectionInfraForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-infra/$subsubsectionInfraId/edit/",
)

export function PageSubsubsectionInfraEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.subsubsectionInfraId)
  const { data: subsubsectionInfra } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "subsubsectionInfras", id: rowId }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Infrastruktur"
            sectionTo="/$projectSlug/subsubsection-infra"
            item={"slug" in subsubsectionInfra ? shortTitle(subsubsectionInfra.slug) : undefined}
            current="bearbeiten"
          />
        }
      />
      <EditSubsubsectionInfraForm
        subsubsectionInfra={subsubsectionInfra as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
