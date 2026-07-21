import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { EditSubsubsectionTaskForm } from "@/src/components/subsubsection-task/EditSubsubsectionTaskForm"
import { adminLookupRowQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/subsubsection-task/$subsubsectionTaskId/edit/",
)

export function PageSubsubsectionTaskEdit() {
  const params = routeApi.useParams()
  const { projectSlug } = params
  const rowId = Number(params.subsubsectionTaskId)
  const { data: subsubsectionTask } = useSuspenseQuery(
    adminLookupRowQueryOptions({ projectSlug, table: "subsubsectionTasks", id: rowId }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Aufgaben"
            sectionTo="/$projectSlug/subsubsection-task"
            current="bearbeiten"
          />
        }
      />
      <EditSubsubsectionTaskForm
        subsubsectionTask={subsubsectionTask as never}
        projectSlug={projectSlug}
      />
    </>
  )
}
