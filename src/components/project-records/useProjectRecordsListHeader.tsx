import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { TabsApp } from "@/src/components/core/components/Tabs/TabsApp"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { useIsProjectLeadOrAdmin } from "@/src/components/shared/app/memberships/hooks/useIsProjectLeadOrAdmin"
import { projectRecordsTabCountsQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export function useProjectRecordsListHeader() {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const { data: tabCounts } = useSuspenseQuery(projectRecordsTabCountsQueryOptions({ projectSlug }))
  const { data: project } = useQuery(projectBySlugQueryOptions(projectSlug))
  const isProjectLeadOrAdmin = useIsProjectLeadOrAdmin(project)
  const showLeadTabs = isProjectLeadOrAdmin && tabCounts.aiEnabled

  const tabs = [
    {
      name: `Protokolleinträge (${tabCounts.approvedCount})`,
      to: `/${projectSlug}/project-records`,
    },
    ...(showLeadTabs
      ? [
          {
            name: `Posteingang (${tabCounts.inboxCount})`,
            to: `/${projectSlug}/project-records/inbox`,
          },
        ]
      : []),
    // Entries an admin saved from the Posteingang, and older KI entries.
    ...(showLeadTabs && tabCounts.needsReviewCount > 0
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
