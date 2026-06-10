import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { EditSubsubsectionSpecialForm } from "@/src/components/subsubsection-special/EditSubsubsectionSpecialForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-special/$subsubsectionSpecialId/edit/",
)

export function PageSubsubsectionSpecialEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.subsubsectionSpecialId)
  const { data: subsubsectionSpecial } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "subsubsectionSpecials", id: rowId }),
  )

  return (
    <>
      <PageHeader title="Besonderheit bearbeiten" />
      <EditSubsubsectionSpecialForm
        subsubsectionSpecial={subsubsectionSpecial as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
