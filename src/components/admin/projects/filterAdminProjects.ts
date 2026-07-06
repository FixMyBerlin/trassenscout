import type { AdminProjectWithCounts } from "@/src/server/projects/types"

export function filterAdminProjects(projects: AdminProjectWithCounts[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return projects

  return projects.filter((project) => project.slug.toLowerCase().includes(normalizedQuery))
}
