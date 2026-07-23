import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { EditSubsectionStatusForm } from "@/src/components/subsection-status/EditSubsectionStatusForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsection-status/$subsectionStatusId/edit/",
)

export function PageSubsectionStatusEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.subsectionStatusId)
  const { data: subsectionStatus } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "subsectionStatuses", id: rowId }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Status"
            sectionTo="/$projectSlug/subsection-status"
            item={"slug" in subsectionStatus ? shortTitle(subsectionStatus.slug) : undefined}
            current="bearbeiten"
          />
        }
      />
      <EditSubsectionStatusForm
        subsectionStatus={subsectionStatus as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
