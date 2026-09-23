import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { z } from "zod"
import { PageProjectActivity } from "@/src/components/pages/PageProjectActivity"
import { privateTitleHead } from "@/src/routeHead"
import { logEntriesInfiniteQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import { myAssignedRecordsCountQueryOptions } from "@/src/server/projectRecords/projectRecordsQueryOptions"
import { projectBySlugQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { DASHBOARD_ALL_MONTHS } from "@/src/shared/dashboard/searchSchemas"

const activitySearchSchema = z.object({
  months: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(DASHBOARD_ALL_MONTHS)
    .catch(DASHBOARD_ALL_MONTHS),
})

export const Route = createFileRoute("/_loggedInProjects/$projectSlug/activity/")({
  head: () => privateTitleHead("Aktivitäten"),
  ssr: true,
  validateSearch: activitySearchSchema,
  search: {
    middlewares: [stripSearchParams({ months: DASHBOARD_ALL_MONTHS })],
  },
  loaderDeps: ({ search }) => ({ months: search.months }),
  loader: ({ context, params, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(projectBySlugQueryOptions(params.projectSlug)),
      context.queryClient.ensureQueryData(myAssignedRecordsCountQueryOptions(params.projectSlug)),
      context.queryClient.ensureInfiniteQueryData(
        logEntriesInfiniteQueryOptions({
          projectSlug: params.projectSlug,
          months: deps.months || undefined,
        }),
      ),
    ]),
  component: PageProjectActivity,
})
