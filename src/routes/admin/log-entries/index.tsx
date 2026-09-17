import { createFileRoute } from "@tanstack/react-router"
import { PageAdminLogEntries } from "@/src/components/pages/admin/log-entries/PageAdminLogEntries"
import { adminTitleHead } from "@/src/routeHead"
import { generalLogEntriesQueryOptions } from "@/src/server/logEntries/logEntriesQueryOptions"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"
import { logEntriesSearchSchema } from "@/src/shared/logEntries/searchSchemas"

export const Route = createFileRoute("/admin/log-entries/")({
  head: () => adminTitleHead("Log-Einträge"),
  ssr: true,
  validateSearch: logEntriesSearchSchema,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(generalLogEntriesQueryOptions()),
      context.queryClient.ensureQueryData(projectsForCurrentUserQueryOptions()),
    ]),
  component: PageAdminLogEntries,
})
