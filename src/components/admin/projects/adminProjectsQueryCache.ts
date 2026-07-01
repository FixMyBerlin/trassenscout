import type { QueryClient } from "@tanstack/react-query"
import { adminProjectsWithCountsQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import type { AdminProjectWithCounts } from "@/src/server/projects/types"

type AdminProjectsWithCountsQueryData = {
  projects: AdminProjectWithCounts[]
}

export function updateAdminProjectInCache(
  queryClient: QueryClient,
  projectSlug: string,
  updater: (project: AdminProjectWithCounts) => AdminProjectWithCounts,
) {
  queryClient.setQueryData<AdminProjectsWithCountsQueryData>(
    adminProjectsWithCountsQueryOptions().queryKey,
    (currentData) => {
      if (!currentData) return currentData

      return {
        ...currentData,
        projects: currentData.projects.map((project) =>
          project.slug === projectSlug ? updater(project) : project,
        ),
      }
    },
  )
}
