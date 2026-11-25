import { createFileRoute } from "@tanstack/react-router"
import { bookmarksProjectSlug } from "@/src/components/dashboard/dashboardBookmarks"
import { PageDashboardBookmarks } from "@/src/components/pages/PageDashboardBookmarks"
import { privateTitleHead } from "@/src/routeHead"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { myBookmarkedSubsubsectionsQueryOptions } from "@/src/server/subsubsectionBookmarks/subsubsectionBookmarksQueryOptions"
import { currentUserQueryOptions } from "@/src/server/users/usersQueryOptions"
import {
  dashboardBookmarksSearchSchema,
  dashboardFilterValues,
} from "@/src/shared/dashboard/searchSchemas"

export const Route = createFileRoute("/_loggedInGeneral/dashboard/bookmarks/")({
  head: () => privateTitleHead("Meine Maßnahmen"),
  ssr: "data-only",
  validateSearch: dashboardBookmarksSearchSchema,
  loaderDeps: ({ search }) => ({ projectSlug: dashboardFilterValues(search).projectSlug }),
  loader: async ({ context, deps }) => {
    const [, projects] = await Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(projectsForCurrentUserQueryOptions()),
    ])
    await context.queryClient.ensureQueryData(
      myBookmarkedSubsubsectionsQueryOptions({
        projectSlug: bookmarksProjectSlug(projects, deps.projectSlug),
      }),
    )
  },
  component: PageDashboardBookmarks,
})
