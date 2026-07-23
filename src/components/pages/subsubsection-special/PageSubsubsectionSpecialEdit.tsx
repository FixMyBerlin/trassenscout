import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
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
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Besonderheiten"
            sectionTo="/$projectSlug/subsubsection-special"
            item={
              "slug" in subsubsectionSpecial ? shortTitle(subsubsectionSpecial.slug) : undefined
            }
            current="bearbeiten"
          />
        }
      />
      <EditSubsubsectionSpecialForm
        subsubsectionSpecial={subsubsectionSpecial as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
