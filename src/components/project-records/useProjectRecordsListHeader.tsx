import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useRouteContext } from "@tanstack/react-router"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { editorRoles } from "@/src/server/authorization/constants"
import { projectRecordsTabCountsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export function useProjectRecordsListHeader() {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { membershipRole } = useRouteContext({
    from: "/_loggedInProjects/$projectSlug",
  })
  const { data: tabCounts } = useSuspenseQuery(projectRecordsTabCountsQueryOptions({ projectSlug }))

  const isAdmin = membershipRole === null
  const canEdit = isAdmin || (membershipRole && editorRoles.includes(membershipRole))

  const tabs = [
    {
      name: `Protokolleinträge (${tabCounts.approvedCount})`,
      to: `/${projectSlug}/project-records`,
    },
    ...(isAdmin && tabCounts.aiEnabled
      ? [
          {
            name: `Posteingang (${tabCounts.inboxCount})`,
            to: `/${projectSlug}/project-records/inbox`,
          },
        ]
      : []),
    // Stays until the AI entries created before the Posteingang are confirmed.
    ...(canEdit && tabCounts.aiEnabled && tabCounts.needsReviewCount > 0
      ? [
          {
            name: `Bestätigung erforderlich (${tabCounts.needsReviewCount})`,
            to: `/${projectSlug}/project-records/needreview`,
          },
        ]
      : []),
  ]

  return {
    breadcrumb: <ProjectPageBreadcrumb section="Projektprotokoll" />,
    tabs: <TabsApp tabs={tabs} embedded />,
  }
}
