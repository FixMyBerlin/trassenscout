import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
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
      <PageHeader title="Status bearbeiten" />
      <EditSubsectionStatusForm
        subsectionStatus={subsectionStatus as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
