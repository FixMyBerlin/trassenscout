import { useQuery } from "@tanstack/react-query"
import { projectsWithGeometryWithMembershipRoleQueryOptions } from "@/src/server/projects/projectsQueryOptions"

/** Dokumente only makes sense across several projects. */
export function useDashboardTabs() {
  const { data: projects = [] } = useQuery(projectsWithGeometryWithMembershipRoleQueryOptions())

  const tabs: { name: string; to: string }[] = [{ name: "Projekte", to: "/dashboard" }]
  if (projects.length > 1) tabs.push({ name: "Dokumente", to: "/dashboard/uploads" })

  return tabs
}
