import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Outlet, useMatchRoute, useRouteContext } from "@tanstack/react-router"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { editorRoles } from "@/src/server/authorization/constants"
import { projectRecordsTabCountsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export function LayoutProjectRecords() {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { membershipRole } = useRouteContext({ from: "/_loggedInProjects/$projectSlug" })
  const { data: tabCounts } = useSuspenseQuery(projectRecordsTabCountsQueryOptions({ projectSlug }))

  const matchRoute = useMatchRoute()
  const isListView =
    Boolean(matchRoute({ to: "/$projectSlug/project-records", params: { projectSlug } })) ||
    Boolean(matchRoute({ to: "/$projectSlug/project-records/needreview", params: { projectSlug } }))

  const canEdit =
    membershipRole === null || (membershipRole && editorRoles.includes(membershipRole))

  const tabs = [
    {
      name: `Protokolleinträge (${tabCounts.approvedCount})`,
      to: `/${projectSlug}/project-records`,
    },
    ...(canEdit && tabCounts.aiEnabled
      ? [
          {
            name: `Bestätigung erforderlich (${tabCounts.needsReviewCount})`,
            to: `/${projectSlug}/project-records/needreview`,
          },
        ]
      : []),
  ]

  return (
    <>
      {isListView && (
        <>
          <PageHeader
            breadcrumb={<ProjectPageBreadcrumb section="Projektprotokoll" />}
            tabs={<TabsApp tabs={tabs} embedded />}
            title="Projektprotokoll"
          />
        </>
      )}
      <Outlet />
    </>
  )
}
