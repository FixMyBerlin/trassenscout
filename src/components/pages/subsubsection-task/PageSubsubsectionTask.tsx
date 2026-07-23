import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { ConditionalBackLink } from "@/src/components/core/components/forms/ConditionalBackLink"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { useTryRouteSearchKey } from "@/src/components/core/routes/useTryRouteSearch"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useUserCan } from "@/src/components/shared/app/memberships/hooks/useUserCan"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { SubsubsectionTasksTable } from "@/src/components/subsubsection-task/SubsubsectionTasksTable"
import { useSubsubsectionTaskRouteLinks } from "@/src/components/subsubsection-task/useSubsubsectionTaskActions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/subsubsection-task/")

export function PageSubsubsectionTask() {
  const { projectSlug } = routeApi.useParams()
  const canEdit = useUserCan().edit
  const fromPath = useTryRouteSearchKey("from")
  const { newLink } = useSubsubsectionTaskRouteLinks(projectSlug)
  const { data } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "subsubsectionTasks",
    }),
  )
  const rows = data.rows

  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Aufgaben" />}
        primaryAction={
          canEdit ? (
            <Link button="blue" icon="plus" {...newLink}>
              Neue Aufgabe
            </Link>
          ) : undefined
        }
      />
      <SubsubsectionTasksTable subsubsectionTasks={rows} />
      <div className={pageContentPaddingClassName}>
        <IfUserCanEdit>
          <ConditionalBackLink fromPath={fromPath} />
        </IfUserCanEdit>
        <SuperAdminLogData data={{ subsubsectionTasks: rows }} />
      </div>
    </>
  )
}
